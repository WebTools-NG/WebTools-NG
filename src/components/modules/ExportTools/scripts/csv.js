// This file handles CSV exports



const csv = new class CSV {
    constructor() {
    }

    async addRowToTmp({ stream: stream, item: item})
    {
        return new Promise(function(resolve) {
            stream
            console.log('Ged 6 CSV addRowToTmp', JSON.stringify(item))
            resolve();
        });
        
    }



}

export { csv };