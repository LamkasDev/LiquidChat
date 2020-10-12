class Endpoint {
    constructor(app) {
        this.app = app;
    }

    handle() {
        this.app.get('/fetchEmote', (async(req, res) => {
            if(!this.app.isSessionValid(this.app, req, res)) { return; }
            const data = req.query;
            var emote = await this.app.db.db_fetch.fetchEmote(this.app.db, data.id);

            if(emote === undefined) {
                res.send(JSON.stringify({ status: -1 }))
            } else {
                res.send(JSON.stringify(emote))
            }
        }).bind(this));
    }
}

module.exports = Endpoint;