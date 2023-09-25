import { RelativeFlag } from "./appType";
declare var IDValidator;
export class People {
    id?: number;
    name?: string;
    peopleNumber?: string;
    fatherId?: string;
    motherId?: string;

    relativeFlag?: RelativeFlag;

    thumbUrl?: string;

    birthday?: string;
    sex?: string;
    telephone?: string;

    static male = '男'
    static female = '女'

    static serverImg = 'http://114.115.201.238/mjmap/images/'

    getRelation(p: People): RelativeFlag {
        const year = Number(p.peopleNumber.substring(6, 10));
        const baseYear = Number(this.peopleNumber.substring(6, 10));

        if (baseYear > year && baseYear - year > 15) {
            return p.sex == '男' ? RelativeFlag.father : RelativeFlag.mother;
        } else if (baseYear < year && year - baseYear > 15) {
            return p.sex == '男' ? RelativeFlag.son : RelativeFlag.daughter
        } else {
            return null;
        }
    }

    getRelation2(p: People): RelativeFlag {
        if (p.sex == '男') {
            if (p.fatherId == this.peopleNumber || p.motherId == this.peopleNumber) {
                return RelativeFlag.son;
            } else if (p.peopleNumber == this.fatherId) {
                return RelativeFlag.father;
            }
        } else {
            if (p.fatherId == this.peopleNumber || p.motherId == this.peopleNumber) {
                return RelativeFlag.daughter;
            } else if (p.peopleNumber == this.motherId) {
                return RelativeFlag.mother;
            }
        }
        return RelativeFlag.unKnow;
    }

    isParent(p:People){
        return this.fatherId==p.peopleNumber || this.motherId == p.peopleNumber
    }

    isChild(p:People){
        return p.fatherId == this.peopleNumber || p.motherId == this.peopleNumber
    }

    isRandomPid() {
        return this.peopleNumber.substring(0, 8) == '41000018'
    }

    static isPid(str: string) {
        const validator = new IDValidator();
        return validator.isValid(str)
    }

    static isChinese(str: string) {
        const re = /^[\u4E00-\u9FA5]+$/g;
        if (!re.test(str)) return false;
        return true;
    }

    static toPeople(o:any){
        let p = new People();
        for(let key in o){
            p[key] = o[key]
        }
        return p;
    }


}