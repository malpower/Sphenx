const {JSDOM}=require("jsdom");
const fetch=require("node-fetch");
const urlUtils=require("url");
class Framework
{
    constructor({entrance, history, ready, hosts, retryCount=1})
    {
        this.entrance=entrance;
        this.hosts=hosts;
        this.history=history;
        this.scannedPageUrls=new Array;
        this.retryCount=retryCount;
        this.ready=ready;
        if (this.ready.length===0)
        {
            this.ready=[entrance];
        }
    }
    async loadPage(url)
    {
        let prefetch=await fetch(url, {method: "HEAD"});
        let retried=0;
        while (true)
        {
            retried+=1;
            if (prefetch.status!==200)
            {
                if (retried===this.retryCount)
                    throw new Error(`${prefetch.status} @ ${url}`);
            }
            else
            {
                break;
            }
        }
        if (!prefetch.headers.get("content-type").includes("html"))
        {
            throw new Error(`not a page, ${prefetch.headers.get("content-type")}`);
        }
        let res=await fetch(url);
        const html=await res.text();
        return new JSDOM(html,{url});
    }
    async start(concurrent)
    {
        while (this.ready.length>0)
        {
            let ps=new Array;
            for (let i=0;i<concurrent;i++)
            {
                ps.push(new Promise(async (resolve)=>
                {
                    if (this.ready.length===0)
                    {
                        return resolve();
                    }
                    let url=this.ready.shift();
                    await this.work(url);
                    resolve();
                }));
            }
            await Promise.all(ps);
        }
        return this.scannedPageUrls;
    }
    async analysisPage()
    {
    }
    async work(url)
    {
        url=url || this.entrance;
        if (this.history.includes(url))
        {
            return;
        }
        const parsedUrl=urlUtils.parse(url);
        if (!this.hosts.includes(parsedUrl.host))
        {
            return;
        }
        this.history.push(url);
        let page, links;
        try
        {
            page=await this.loadPage(url);
            links=await this.getLinksOnPage(page);
        }
        catch (e)
        {
            return;
        }
        links=links.map(v=>v.href).filter(v=>!this.history.includes(v)).filter(v=>!this.ready.includes(v));
        let reduce=new Set(links);
        for (let link of reduce.keys())
        {
            this.ready.push(link);
        }
        this.scannedPageUrls.push(url);
        await this.analysisPage(page);
    }
    async getLinksOnPage(page)
    {
        const {document}=page.window;
        const collection=document.getElementsByTagName("a");
        let links=new Array;
        for (let i=0;i<collection.length;i++)
        {
            links.push(collection[i]);
        }
        links=links.map(v=>urlUtils.parse(v.href)).filter(v=>[null, "http:", "https:"].includes(v.protocol)).filter(v=>v.path!==null).map((v)=>
        {
            if (v.protocol===null)
            {
                return urlUtils.parse(`${page.window.location}${v.path}`);
            }
            return v;
        });
        return links;
    }
}

module.exports={Framework};
