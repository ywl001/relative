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
export class KinshipService {

  private UP: number = 1;
  private DOWN: number = -1;
  private BASE: number = 0;

  private checkedPeoples: People[];
  private queryFlag: number;

  private currentNode: KinshipNode;
  private nodes: KinshipNode[] = [];
  private waitCheckNodes: KinshipNode[] = [];

  private basePeople: People;
  private baseNode: KinshipNode;

  constructor(
    private sql: SqlService,
    private message: MessageService,
    private localService: LocalStorgeService) { }


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
      console.log("当前节点", this.currentNode.name)
      this.sql.getPeopleRelatives(node.queryPeople.peopleNumber).subscribe(res => {
        this.processData(res)
      })
    } else {
      console.log("查询完毕");
      this.nodes = this.setNodeLevel(this.nodes);
      console.log(this.nodes)
      this.saveDataToLocal();

      this.message.getNodesSuccess(this.nodes);
    }
  }
  
  private processData(peoples: People[]) {
    const peopleMap = this.groupPeople(peoples);
    const parents = peopleMap.get('parent');
    const children = peopleMap.get('child');
    if (parents?.length > 0) {
      if (this.currentNode.parent) {
        const parentNode: KinshipNode = this.currentNode.parent;
        if (this.isParentNodeRight(this.currentNode.queryPeople, parentNode)) {
          //父节点信息正确
          console.log("父节点正确", this.currentNode.sibHuman.name);
        } else if (parentNode.sibHuman && parentNode.spouse) {
          const newParentNode = this.createParentNode(this.currentNode, parents);
          this.nodes.push(newParentNode);
        } else{
          for (let i = 0; i < parents.length; i++) {
            const p = parents[i];
            parentNode.setPeople(p);
          }
        }
      } else {
        const node = this.createParentNode(this.currentNode, parents);
        this.waitCheckNodes.push(node);
      }
    }
    
    if (children?.length > 0) {
      children.forEach(child => {
        if (this.isPeopleChecked(this.checkedPeoples, child)) {
          console.log(child.name + '已经查询过了')
          return;
        }
        const childNode = this.createChildNode(this.currentNode, child);
        console.log('创建子节点', childNode.sibHuman.name)
        this.waitCheckNodes.push(childNode);
      })
    }

    this.nextNode();
  }

  private createParentNode(currentNode: KinshipNode, peoples: People[]) {
    let node = new KinshipNode();
    node.level = currentNode.level + 1;
    node.children.push(currentNode);
    node.flag = this.UP;
    currentNode.parent = node;

    for (let i = 0; i < peoples.length; i++) {
      const p = peoples[i];
      node.setPeople(p)
    }
    return node;
  }

  private createChildNode(currentNode: KinshipNode, p: People) {
    let node = new KinshipNode();
    node.sibHuman = p;
    node.level = currentNode.level - 1;
    node.parent = currentNode;
    currentNode.children.push(node);
    node.flag = this.DOWN;
    return node
  }

  private groupPeople(peoples: People[]) {
    const basePeople = this.currentNode.queryPeople;
    let peopleMap: Map<string, People[]> = new Map();
    peoples.forEach(p => {
      if (basePeople.isParent(p)) {
        if (!peopleMap.get('parent')) {
          peopleMap.set('parent', [p])
        } else {
          peopleMap.get('parent').push(p)
        }
      } else if (basePeople.isChild(p)) {
        if (!peopleMap.get('child')) {
          peopleMap.set('child', [p])
        } else {
          peopleMap.get('child').push(p)
        }
      }
    })
    console.log(peopleMap)
    return peopleMap;
  }

  private nextNode() {
   
    console.log("查询了" + this.currentNode.name)
    toastr.remove();
    toastr.info("查询了" + this.currentNode.name);
    toastr.options={
      "positionClass": "toast-bottom-center"
    }
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
    return this.getParentId(p) == parentNode.id ||
      parentNode.id.indexOf(this.getParentId(p)) > -1;
  }

  /**
     * 获取人员中保存的父母身份证号码信息，如果两个都存在，使用，隔开
     */
  private getParentId(p: People): string {
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
    this.nodes.forEach(node => {
      // if(node.sibHuman.)
      // if(node.parent?.sibHuman?.sex == '男')
      //   this.localService.setNode(node.pid,this.nodes)

      // if(!this.getNodeParentIsWoman(node)){
      //   this.localService.setNode(this.getLocalKey(node),this.nodes)
      // }
    })

    // this.localService.setNode(this.getLocalKey(this.baseNode),this.nodes)
  }

  private getNodeParentIsWoman(node: KinshipNode): boolean {
    if (node.parent) {
      if (node.parent?.sibHuman?.sex == '女')
        return true;
      this.getNodeParentIsWoman(node.parent)
    }
    return false;
  }

  private getLocalKey(node: KinshipNode) {
    return `${node.name}->${node.pid}`
  }

}
