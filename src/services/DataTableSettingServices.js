import { serviceBase } from './ServiceBase';
export const dataTableSettingServices = {
    get,
    set,
}


async function get() {
    var url = `${process.env.REACT_APP_ENGINE_URL}/userDataTableSetting/getAllByUserId`;
    return serviceBase.get(url)
        .then((response) => {
            if (response?.data) {
                return response.data;
            }
            return [];
        });
}

async function set(tableKey, info) {
    let state = JSON.stringify(info);
    window.localStorage.setItem(tableKey, state);

    var url = `${process.env.REACT_APP_ENGINE_URL}/userDataTableSetting/set`;
    var body = {
        "tableKey": tableKey,
        "options": state,
        "userId": null
    };

    return await serviceBase.post(url, body).then((response) => {
        if (response) {
            if (response.code && response.code === "0") {
                return true;
            }
            return response.errors || [response.message];
        }
    });
}


