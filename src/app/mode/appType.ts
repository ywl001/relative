// export interface People{
//     id?:number;
//     name?:string;
//     peopleNumber?:string;
//     fatherId?:string;
//     motherId?:string;

//     relativeFlag?:RelativeFlag;

//     thumbUrl?:string;

//     birthday?:string;
//     sex?:string;
//     telephone?:string;
// }

export enum RelativeFlag{
    base = '本人',
    father = '父亲',
    mother='母亲',
    son='儿子',
    daughter='女儿',
    unKnow = '未知'
}

export enum bgColor {
    blue = '#2B6695',
    orange = '#fd6703'
  }

export enum Tips{
    relationError='人员之间相差不到15岁，应该不是父子关系',
    confirmRelation = '确定要添加这个直系亲属吗?',
    ok = '确定',
    cancel = '取消',
    success = '设置成功',
    faile = '设置失败',
    title1 = '设置基准人员',
    title2 = '设置直系亲属，仅指父母子女',
    delRelation = '确定要删除这个直系亲属吗?'
}
  