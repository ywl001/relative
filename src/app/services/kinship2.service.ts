import { Injectable } from '@angular/core';

import * as toastr from 'toastr';
import { People } from '../mode/Person';
import { KinshipNode } from '../mode/kinship';
import { LocalStorgeService } from './local-storge.service';
import { MessageService } from './message.service';
import { SqlService } from './sql.service';

@Injectable({
  providedIn: 'root'
})
export class KinshipService2 {

  private UP: number = 1;
  private DOWN: number = -1;
  private BASE: number = 0;

  private checkedPeoples: People[];
  private queryFlag: number;

  private currentNode: KinshipNode;
  private nodes: KinshipNode[] = [];
  private waitCheckNodes: KinshipNode[] = [];

  private basePeople:People;
  private baseNode:KinshipNode;

  constructor(
    private sql: SqlService, 
    // private store: Store, 
    private message: MessageService,
    private localService:LocalStorgeService) { }


  public set data(human: People) {
    this.basePeople = human;
    this.checkedPeoples = [];
    this.nodes = [];
    this.waitCheckNodes = [];

    this.currentNode = new KinshipNode();
    this.currentNode.level = 0;
    this.currentNode.sibHuman = human;
    this.currentNode.flag = this.BASE;
    this.baseNode = this.currentNode;

    this.waitCheckNodes.push(this.currentNode);
    this.queryNode(this.waitCheckNodes);
  }

  private queryNode(waitCheckNodes: KinshipNode[]) {
    var node: KinshipNode = waitCheckNodes[0];
    if (node) {
      this.currentNode = node;
      this.upQuery(node);
    } else {
      console.log("查询完毕");
      this.nodes = this.setNodeLevel(this.nodes);
      this.saveDataToLocal();
      // this.store.dispatch(action_getNodesSuccess({nodes:this.nodes}))
      this.message.getNodesSuccess(this.nodes);
    }
  }

  /**
   *向上查询，只查询男性的上级
   * @param node 
   */
  private upQuery(node: KinshipNode) {
    this.queryFlag = this.UP;
    if (node.parent && this.isParentNodeRight(node.sibHuman, node.parent)) {
      //如果人员父节点存在，并且和人员中存在的父母信息一致，不再查询
      console.log("下级节点向上查询，父节点和自己存的父母信息一致", node.sibHuman.name);
      this.downQuery();
    } else if (!node.sibHuman) {
      //如果节点中的sibman不存在
      console.log("向上查询，节点中没有男性，不再向上查询")
      this.downQuery()
    }
    else {
      console.log("向上查询：当前节点", node.name);
      var parentNumber: String = this.getParentId(node.sibHuman);
      console.log('parent pid is:', parentNumber)
      if (parentNumber) {
        // this.sql.exec(PhpFunc.selectParentPeoples, parentNumber).subscribe(res => {
        //   // console.log(res)
        //   this.processData(res);
        // })
        this.sql.getParents(this.currentNode.queryPeople.peopleNumber).subscribe(res=>{
          this.processData(res);
        })
      } else {
        this.downQuery();
      }
    }
  }

  private downQuery() {
    this.queryFlag = this.DOWN;
    console.log("向下查询：当前节点", this.currentNode.name);
    // this.sql.exec(PhpFunc.selectChildPeoples, this.currentNode.pid).subscribe(res => {
    //   this.processData(res)
    // })

    this.sql.getChildren(this.currentNode.queryPeople.peopleNumber).subscribe(res=>{
      this.processData(res)
    })
  }

  private processData(peoples: People[]) {
    if (this.queryFlag == this.UP) {
      this.processUpQueryData(peoples)
    } else if (this.queryFlag == this.DOWN) {
      this.processDownQueryData(peoples);
    }
  }

  private processUpQueryData(parents: People[]) {
    console.log('解析父成员数据', parents)
    if (parents.length == 0) {
      console.log("节点没有上级节点");
      this.downQuery();
    } else if (this.currentNode.parent) {
      console.log("父节点已经存在", this.currentNode.name);
      //如果父节点配偶信息存在，同父异母或同母异父，创建新节点
      const parentNode: KinshipNode = this.currentNode.parent;
      if (parentNode.sibHuman && parentNode.spouse) {
        console.log("同父异母情况");
        let node = new KinshipNode();
        node.level = this.currentNode.level + 1;
        node.children.push(this.currentNode);
        this.currentNode.parent = node;

        for (let i = 0; i < parents.length; i++) {
          const p = parents[i];
          parentNode.setPeople(p)
        }

        //不再加入待查数组
        this.nodes.push(node);
      } else {
        //人员父母信息不完整，更新父节点中的配偶信息
        for (let i = 0; i < parents.length; i++) {
          const p = parents[i];
          parentNode.setPeople(p);
        }
      }
      this.downQuery();
    } else {
      //生成新节点

      let node = new KinshipNode();
      node.level = this.currentNode.level + 1;
      node.children.push(this.currentNode);
      node.flag = this.UP;
      this.currentNode.parent = node;

      for (let i = 0; i < parents.length; i++) {
        const p = parents[i];
        node.setPeople(p)
      }
      this.waitCheckNodes.push(node);
      this.downQuery();
    }
  }

  private processDownQueryData(children: People[]) {
    console.log('解析子成员数据', children)
    if (children.length == 0) {
      console.log('没有下级人员。。')
      this.nextNode();
    } else {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (this.isPeopleChecked(this.checkedPeoples, child)) {
          //已经查询过了的节点
          continue;
        } else {
          let node = new KinshipNode();
          node.sibHuman = child;
          node.level = this.currentNode.level - 1;
          node.parent = this.currentNode;
          this.currentNode.children.push(node);
          node.flag = this.DOWN;

          this.waitCheckNodes.push(node);
        }
      }
      this.nextNode();
    }
  }

  private nextNode() {
    toastr.remove();
    toastr.info("查询了" + this.currentNode.name);
    toastr.options.positionClass='toast-bottom-center'
    this.checkedPeoples.push(this.currentNode.sibHuman);
    this.nodes.push(this.waitCheckNodes.shift());//删除待查的第一个，并加入node；

    // console.log("下一个节点",'nodes is:',this.nodes,'waitCheckNodes is:',this.waitCheckNodes)
    this.queryNode(this.waitCheckNodes);

  }

  private setNodeLevel(nodes: KinshipNode[]) {
    let map = new Map();
    let arr = [];

    nodes.forEach(n => {
      if (arr.indexOf(n.level) == -1) {
        arr.push(n.level)
      }
    })

    const maxLevel = Math.abs(Math.max(...arr))
    const a = arr.length - maxLevel;
    arr.forEach(level => {
      map.set(level, arr.length - a - level)
    })

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      node.level = map.get(node.level)
    }

    return nodes;
  }

  private isPeopleChecked(checkeds: People[], p: People): Boolean {
    return checkeds.findIndex(e => e?.peopleNumber == p?.peopleNumber) >= 0
  }

  private isParentNodeRight(p: People, parentNode: KinshipNode): Boolean {
    return this.getParentId(p) == parentNode.id;
  }

  /**
     * 获取人员中保存的父母身份证号码信息，如果两个都存在，使用，隔开
     */
  private getParentId(p: People): String {
    return [p.fatherId, p.motherId].filter(Boolean).join()
  }

  /**保存节点数据到localStorge */
  private saveDataToLocal() {
    // if (this.startAccount) {

    //   const key = this.localService.getNodesKey(this.startAccount.id)
    //   this.localService.setNode(key, this.nodes);
    // } else if (this.isQueryCaseNodes) {
    //   const key = this.localService.getCaseNodeKey(this.lawCase);
    //   this.localService.setNode(key, this.nodes);
    // }
    // const topNode = this.nodes.find(node=>node.level == 0);
    // const key = topNode.name + '-->' + topNode.pid;
    this.nodes.forEach(node=>{
      // if(node.sibHuman.)
      // if(node.parent?.sibHuman?.sex == '男')
      //   this.localService.setNode(node.pid,this.nodes)

      if(!this.getNodeParentIsWoman(node)){
        this.localService.setNode(this.getLocalKey(node),this.nodes)
      }
    })

    this.localService.setNode(this.getLocalKey(this.baseNode),this.nodes)
  }

  private getNodeParentIsWoman(node:KinshipNode):boolean{
    if(node.parent){
      if(node.parent?.sibHuman?.sex == '女')
        return true;
      this.getNodeParentIsWoman(node.parent)
    }
    return false;
  }

  private getLocalKey(node:KinshipNode){
    return `${node.name}->${node.pid}`
  }
}
