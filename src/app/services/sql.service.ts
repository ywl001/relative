import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { People } from '../mode/Person';

const PHP_SQL_URL = '/relative/back/sql.php'

@Injectable({
  providedIn: 'root'
})
export class SqlService {

  ACTION_SELECT = 'select';
  private ACTION_INSERT = 'insert';
  private ACTION_DELETE = 'delete';
  private ACTION_UPDATE = 'update';

  constructor(private http: HttpClient) { }

  getPeopleRelatives(pid:string){
    const sql = `SELECT p.id,sex,name,peopleNumber,fatherId,motherId,thumbUrl,thumbUrl 
      FROM people p LEFT JOIN people_photo pp on pp.peopleID = p.id 
      WHERE 
      peopleNumber = ( SELECT fatherid FROM people WHERE peopleNumber = '${pid}' ) 
      OR 
      peopleNumber = ( SELECT motherId FROM people WHERE peopleNumber = '${pid}' ) GROUP BY id
      UNION 
      SELECT p.id,sex,name,peopleNumber,fatherId,motherId,thumbUrl,thumbUrl 
      FROM people p LEFT JOIN people_photo pp on pp.peopleID = p.id 
      WHERE fatherId = '${pid}' or motherId = '${pid}' 
      GROUP BY id`;
    // console.log(sql)
    return this.execSql(sql, this.ACTION_SELECT).pipe(
      map(res=>this.uniqueArray(res)),
      map(res=>res.map(p=>People.toPeople(p)))
    );;
  }

  getParents(pid:string){
    const sql = `SELECT p.id,sex,name,peopleNumber,fatherId,motherId,thumbUrl,thumbUrl FROM people p LEFT JOIN people_photo pp on pp.peopleID = p.id WHERE 
    peopleNumber = ( SELECT fatherid FROM people WHERE peopleNumber = '${pid}' ) 
    OR 
    peopleNumber = ( SELECT motherId FROM people WHERE peopleNumber = '${pid}' ) GROUP BY id`
    console.log(sql)
    return this.execSql(sql, this.ACTION_SELECT).pipe(
      map(res=>this.uniqueArray(res)),
      map(res=>res.map(p=>People.toPeople(p)))
    );;
  }

  getChildren(pid:string){
    const sql=` select p.id,sex,name,peopleNumber,fatherId,motherId,thumbUrl 
    from people p left join people_photo pp on p.id=pp.peopleID 
    where fatherId =  '${pid}' or motherId = '${pid}' group by id`;
    console.log(sql)
    return this.execSql(sql, this.ACTION_SELECT).pipe(
      map(res=>this.uniqueArray(res)),
      map(res=>res.map(p=>People.toPeople(p)))
    );;
  }

  getPeople(data:any){
    const inputType = data.inputType;
    const keyword = data.input;
    let sql:string;
    if(inputType == 1){
      sql=`select p.id,sex, name,p.peopleNumber,fatherId,motherId,thumbUrl from people p left join people_photo pp on p.id=pp.peopleId where peopleNumber = '${keyword}'`
    }else{
      // sql = `select * from people where match (name) AGAINST('${keyword}' IN BOOLEAN MODE)`
      sql = `select p.id,sex, name,p.peopleNumber,fatherId,motherId,thumbUrl from people p left join people_photo pp on p.id=pp.peopleId where name = '${keyword}'`
    }
    // console.log(sql)
    return this.execSql(sql, this.ACTION_SELECT).pipe(
      map(res=>this.uniqueArray(res)),
      map(res=>res.map(p=>People.toPeople(p)))
    );
  }

  getPhoto(pid:string){
    const sql=`select * from people_photo where pid = '${pid}' limit 1`;
    console.log(sql)
    return this.execSql(sql, this.ACTION_SELECT);
  }

  insert(tableName, data) {
    let sql: string = `insert into ${tableName} (`;

    Object.keys(data).forEach(key => {
      sql += key + ",";
    })

    sql = sql.substring(0, sql.length - 1) + ") values (";

    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value == "now()")//php now（）函数，不能带引号
        sql += value + ",";
      else
        sql += "'" + value + "',";
    })

    sql = sql.substring(0, sql.length - 1) + ")";
    // console.log(sql);
    return this.execSql(sql, this.ACTION_INSERT);
  }

  update(tableName, data, id) {
    let sql = "update " + tableName + " set ";

    Object.keys(data).forEach(key => {
      const value = data[key];
      if(value == null)
        sql+= (key + "=" + value +",");
      else
        sql += (key + "='" + value + "',");
    })
    sql = sql.substring(0, sql.length - 1) + " where id =" + id;
    console.log(sql);
    return this.execSql(sql, this.ACTION_UPDATE);
  }

  delete(tableName,id){
    let sql =  `delete from ${tableName} where id = ${id}`;
    console.log(sql)
    return this.execSql(sql,this.ACTION_DELETE);
  }

  execSql(sql: string, action: string) {
    return this.http.post<any>(PHP_SQL_URL, { 'sql': sql, 'action': action });
  }

  private uniqueArray(arr: People[]) {
    let temp = [];
    arr.forEach(p => {
      if (temp.findIndex(p2 => p.id == p2.id) == -1) {
        temp.push(p)
      }
    })
    return temp;
  }

}
