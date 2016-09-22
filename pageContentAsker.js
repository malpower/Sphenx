let httpinvoke=require("httpinvoke");
let htmlAnalyst=require("./htmlAnalyst");
let querystring=require("url");
let conf=require("./conf");
let urlParser=querystring;



function FormatAddress(url,sub)
{
    let result="";
    try
    {
        let base=querystring.parse(url);
        let pic=querystring.parse(sub);
        if (sub.substring(0,1)==="/")
        {
            result=base.protocol+"//"+base.host+sub;
            return result;
        }
        if (pic.host!==null)
        {
            return sub;
        }
        return base.substring(0,base.lastIndexOf("/"))+sub;
    }
    catch (e)
    {
        return "";
    }
}

function CheckURL(url)
{
    let o=urlParser.parse(url);
    for (let i=0;i<conf.domains.length;i++)
    {
        if (o.host===conf.domains[i])
        {
            return true;
        }
    }
    return false;
}


function Start(url,callback)
{
    let scanned=new Object;
    let taskList=new Array;
    taskList.push(url);
    function DownloadNext()
    {
        if (taskList.length===0)
        {
            console.log("All Task Finished");
            return 0;
        }
        let url=taskList.shift();
        if (!CheckURL(url) || url==="")
        {
            return process.nextTick(DownloadNext);
        }
        if (scanned[url]===true)
        {
            return process.nextTick(DownloadNext);
        }
        httpinvoke(url,"GET",function(err,body,statusCode,headers)
        {
            if (err)
            {
                return process.nextTick(DownloadNext);
            }
            scanned[url]=true;
            htmlAnalyst.analysis(body,function(pages,images)
            {
                for (let i=0;i<pages.length;i++)
                {
                    taskList.push(FormatAddress(url,pages[i]));
                }
                for (let i=0;i<images.length;i++)
                {
                    images[i]=FormatAddress(url,images[i]);
                }
                process.nextTick(callback,images);
                process.nextTick(DownloadNext);
            });
        });
    }
    DownloadNext();
}

module.exports={init: Start};
