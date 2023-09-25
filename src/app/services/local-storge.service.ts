import { Injectable } from '@angular/core';
import * as CircularJSON from 'circular-json';
import { KinshipNode } from '../mode/kinship';

// import * as Flatted from 'flatted';

@Injectable({
  providedIn: 'root',
})

export class LocalStorgeService {
  public localStorage: any;

  constructor() {
    if (!window.localStorage) {
      throw new Error('Current browser does not support Local Storage');
    }
    this.localStorage = window.localStorage;
  }

  public set(key: string, value: string): void {
    this.localStorage[key] = value;
  }

  public get(key: string): string {
    return this.localStorage[key] || null;
  }


  public getObject(key: string) {
    if (this.localStorage[key])
      return JSON.parse(this.localStorage[key]);
    return null
  }

  public setObject(key: string, value: any) {
    this.localStorage[key] = JSON.stringify(value)
  }

  public remove(key: string): any {
    this.localStorage.removeItem(key);
  }

  /**删除包含关键字的所有键 */
  public remove2(keyword: string) {
    Object.keys(this.localStorage).forEach((item) => {
      // console.log(keyword,item)
      if (item.indexOf(keyword) != -1) this.remove(item);
    });
  }

  public setNode(key: string, value: any): void {
    // console.log('save', value);
    this.localStorage[key] = CircularJSON.stringify(value);
    // this.localStorage[key] = Flatted.stringify(value);
  }

  public getNode(key: string): any {
    if (this.localStorage[key]) {
      let res = CircularJSON.parse(this.localStorage[key]);
      if (res) {
        // res.forEach(o=>{
          //   o = this.toNode(o)
          // })
          let nodes=[];
          for (let i = 0; i < res.length; i++) {
            let o = res[i];
            nodes.push(this.toNode(o))
          }
          this.processNodes(nodes)
          console.log(nodes);
          return nodes;
          // return nodes;
      }
    } else {
      return null
    }
  }

  private processNodes(nodes:KinshipNode[]){
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      for (let j = 0; j < node.children.length; j++) {
        let child = node.children[j];
        if(child.id == node.id){
          child = node
        }
      }
      let parent = node.parent;
      if(parent?.id == node.id){
        node.parent = node;
      }
    }
  }

  private toNode(o:any){
    return Object.assign(new KinshipNode(),o);
  }

  /**
   * 每个起始账号对应的节点数据
   * @param startNodeid 
   * @returns 
   */
  public getNodesKey(startNodeid: string) {
    return 'node->>' + startNodeid;
  }


}
