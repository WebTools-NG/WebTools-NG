// This file holds Excel export stuff

const excel = new class EXCEL {
    constructor() {
    }

    async addRowToTmp({ stream: stream, item: item})
    {
        await stream.write( item + "\n");
    }
}

export { excel };