import {Service}         from "../../../lib/master.electron.lib";
import {VMessageService} from "../../component/message";

interface NetWorkError {
    address?: string,
    code?: string,
    errno?: string,
    message: string,
    name?: string,
    port?: number,
    syscall?: any,
}

interface Response {
    result: number;
    message?: string;
    err?: NetWorkError | any;
    data?: any;
}

export const request = (moduleName: string, actionName: string, params: object | undefined = {}): Promise<Response | any> => {
    return new Promise((resolve, reject) => {
        new Service.ServerProxy(moduleName, actionName, params)
            .send()
            .then((response: Response) => {
                if (response.result !== 0) {
                    new VMessageService(`${response.message || response.err.message}`, 'error').init();
                }
                resolve(response);
            })
            .catch((err: any) => {
                reject(err);
            });
    });

};
