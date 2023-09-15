import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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

  getPeople(pid:string){
    const sql = `select * from people where peopleNumber = ${pid}`;
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
}
