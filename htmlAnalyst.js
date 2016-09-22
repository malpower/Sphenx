function Analysis(content,callback)
{
    content=content.toString();
    let images=content.match(/<img [^>]{0,}>/g);
    let pages=content.match(/<a [^>]{0,}>/g);
    for (let i=0;i<pages.length;i++)
    {
        try
        {
            pages[i]=pages[i].match(/href=\"[^\"]\"/i)[0];
            pages[i]=pages[i].substring(6,pages[i].length-1);
        }
        catch (e)
        {
            pages.splice(i,1);
        }
    }
    for (let i=0;i<images.length;i++)
    {
        try
        {
            images[i]=images[i].match(/src=\"[^\"]\"/i)[0];
            images[i]=images[i].substring(5,pages[i].length-1);
        }
        catch (e)
        {
            images.splice(i,1);
        }
    }
    callback(pages,images);
}

module.exports={analysis: Analysis};
