import store from '../../../store';
import i18n from '../../../i18n';


const status = new class Status {
    constructor() {
        this.statusmsg = {};
        this.msgType = {
            // Global stuff range up to 200
            1: i18n.t("Common.Status.Name.Global.Status"),
            2: i18n.t("Common.Status.Name.Global.Info"),
            3: i18n.t("Common.Status.Name.Global.LibsToProcess"),
            8: i18n.t("Common.Status.Name.Global.CurrentLib"),
            9: i18n.t("Common.Status.Name.Global.Item"),
            10: i18n.t("Common.Status.Name.Global.Items"),
            // Time related stuff 201 -> 250
            201: i18n.t("Common.Status.Name.Global.StartTime"),
            202: i18n.t("Common.Status.Name.Global.EndTime"),
            203: i18n.t("Common.Status.Name.Global.TimeElapsed"),
            204: i18n.t("Common.Status.Name.Global.RunningTime")
            // Module ViewState range is 1000 => 1200
            // Module ET range is 1201 => 2400


        };
        this.RevMsgType = {
            // Global stuff
            "Status": 1,
            "Info": 2,
            "LibsToProcess" : 3,
            "StartTime": 201,
            "EndTime":202,
            "TimeElapsed": 203,
            "RunningTime": 204,
            "CurrentLib": 8,
            "Item": 9,
            "Items": 10
        }
    }

    // Clear Status Window
    async clearStatus()
    {
        this.statusmsg = {};
        store.commit("UPDATE_Status", '');
        return;
    }

    // Update status msg
    async updateStatusMsg(msgType, msg)
    {
        console.log('Ged 55-0 msgType: ' +  msgType)
        console.log('Ged 55-1 msg: ' +  msg)
        // Update relevant key
        //const translatedMsgType = 
        this.statusmsg[msgType] = msg;
        // Tmp store of new msg
        let newMsg = '';
        // Walk each current msg keys
        Object.entries(this.statusmsg).forEach(([key, value]) => {
            if ( value != '')
            {
                newMsg += this.msgType[key] + ': ' + value + '\n';
            }
        })
        store.commit("UPDATE_Status", newMsg);
    }

}

export { status };