import { People, RelativeFlag } from "./appType";

declare var IDValidator;
export class PeopleUtils {

    static isChinese(str: string) {
        const re = /^[\u4E00-\u9FA5]+$/g;
        if (!re.test(str)) return false;
        return true;
    }

    static isPid(str: string) {
        const validator = new IDValidator();
        return validator.isValid(str)
    }

    static getRelation(basePeople,p: People): RelativeFlag {
        const year = Number(p.peopleNumber.substring(6, 10));
        const baseYear = Number(this.basePeople.peopleNumber.substring(6, 10));

        if (baseYear > year && baseYear - year > 15) {
            return p.sex == '男' ? RelativeFlag.father : RelativeFlag.mother;
        } else if (baseYear < year && year - baseYear > 15) {
            return p.sex == '男' ? RelativeFlag.son : RelativeFlag.daughter
        } else {
            toastr.info('人员之间年龄小于15岁，可能并非父母或子女');
            return null;
        }
    }

    static isRandomPid(pid: string) {
        return pid.substring(0, 8) == '41000018'
    }




}