var epubjs = {
    view:function(res){
        var nowshowpage=-1;
        var nowshowhash='';
        var epubContainer=document.createElement('div');
        epubContainer.className='epub-container';
        epubContainer.innerHTML=`<div class="epub-toc">
            <div class="epub-toc-list"></div>
        </div>
        <div class="epub-content">
            <div class="content"></div>
            <div class="page-switch">
                <div class="last">上一页</div>
                <div class="next">下一页</div>
            </div>
            <div class="page-jump">
                <p>跳转至<select></select>页</p>
            </div>
        </div>`;
        document.body.appendChild(epubContainer);
        var o=document.querySelector('.epub-content .content');
        function gtoc(n,r){
            r.forEach(function(e){
                var a=document.createElement('div');
                a.classList.add('epub-toc-item');
                a.innerText=e.label;
                a.setAttribute('data-href',e.href);
                a.setAttribute('data-hash',e.hash);
                n.appendChild(a);
                a.addEventListener('click',function(){
                    var t=a.getAttribute('data-href');
                    var i=a.getAttribute('data-hash');
                    epubContainer.querySelectorAll('.epub-toc-item').forEach(function(a){
                        a.classList.remove('active');
                    })
                    a.classList.add('active');
                    view(t,i)
                });
                if(e.list){
                    var b=document.createElement('div');
                    b.classList.add('epub-toc-list');
                    n.appendChild(b);
                    gtoc(b,e.list);
                }
            })
        }
        gtoc(epubContainer.querySelector('.epub-toc-list'),res.toc);
        var texts=res.texts;
        var select=epubContainer.querySelector('.page-jump select');
        for(var i=0;i<texts.length;i++){
            var o2=document.createElement('option');
            o2.innerText=i+1;
            o2.value=i;
            select.appendChild(o2);
        }
        var _=true;
        select.addEventListener('change',function(){
            if(_){
                var u=texts[select.value];
                view(u,'');
            }else{
                _=true;
            }
        });
        async function view(t,i){
            _=false;
            var index=texts.indexOf(t);
            if(index==-1||index==nowshowpage){
                return;
            }else{
                nowshowpage=index;
                nowshowhash=i;
                select.value=nowshowpage;
                _=true;
                var html=await res.getData(t);

                var d=new DOMParser().parseFromString(html,'text/html');
                var aimg=d.querySelectorAll('img');
                for(var j=0;j<aimg.length;j++){
                    var e=aimg[j];
                    var src=e.getAttribute('src');
                    var rp=epubjs.joinPath(texts[nowshowpage],'../',src);
                    var u=await res.getData(rp);
                    e.src=u;
                }
                var aimage=d.querySelectorAll('image');
                for(var j=0;j<aimage.length;j++){
                    var e=aimage[j];
                    var attrs=['src','href','xlink:href'];
                    for(var k=0;k<attrs.length;k++){
                        var attr=attrs[k];
                        var src=e.getAttribute(attr);
                        if(src){
                            var rp=epubjs.joinPath(texts[nowshowpage],'../',src);
                            var u=await res.getData(rp);
                            e.setAttribute(attr,u);
                        }
                    }
                }
                var astyle=d.querySelectorAll('link[rel=stylesheet]');
                for(var j=0;j<astyle.length;j++){
                    var e=astyle[j];
                    var s=document.createElement('style');
                    var rp=epubjs.joinPath(texts[nowshowpage],'../',e.getAttribute('href'));
                    s.innerHTML=await res.getData(rp);
                    document.head.appendChild(s);
                }
                
                document.title=d.querySelector('title').innerText;
                o.innerHTML=d.body.innerHTML;
                o.querySelectorAll('a').forEach(function(e){
                    e.onclick=function(ev){
                        ev.preventDefault();
                        if(e.getAttribute('href').indexOf('://')!=-1){
                            if(confirm('即将跳转至：'+e.getAttribute('href')+'，是否继续？')){
                                window.open(e.getAttribute('href'));
                            }
                        }else{
                            var h=e.getAttribute('href').split('#');
                            var link=h[0];
                            h.shift();
                            var i=h.join('#');
                            try {
                                if(link.trim()){
                                    console.log('view:',link,i);
                                    view(epubjs.joinPath(texts[nowshowpage],'../',link),i);
                                }else{
                                    nowshowhash=i;
                                    o.querySelector('#'+i).scrollIntoView();
                                }
                            } catch (error) {
                                
                            }
                        }
                        
                    }
                });
            }
            try {
                o.querySelector('#'+i).scrollIntoView();
            } catch (error) {
                o.parentElement.scrollTop=0;
            }
            epubContainer.querySelectorAll('.epub-toc-item').forEach(function(a){
                a.classList.remove('active');
                if(a.getAttribute('data-href')==t){
                    a.classList.add('active');
                }
            });
        }
        this.jumpPage=function(i){
            var u=texts[select.value];
                view(u,'');
        };
        document.title=res.title;
        o.innerHTML=`<div class="epub_info_show">
            <img src="${res.cover}"/>
            <p class="title">${res.title}</p>
            <p class="writer">${res.writer}</p>
            <p class="publisher">${res.publisher}</p>
        </div>`;
        epubContainer.querySelector('.page-switch .last').addEventListener('click',function(){
            if(nowshowpage==0){
                return;
            }else{
                var u=texts[nowshowpage-1];
                view(u,'');
            }
        });
        epubContainer.querySelector('.page-switch .next').addEventListener('click',function(){
            if(nowshowpage==texts.length-1){
                return;
            }else{
                var u=texts[nowshowpage+1];
                view(u,'');
            }
        })
    },
    jumpPage:function(i){
        console.log('No Book Opened Now');
    },

    // 'path' module extracted from Node.js v8.11.1 (only the posix part)
    // transplited with Babel

    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.
    // ----
    assertPath:function assertPath(path) {
        if (typeof path !== 'string') {
          throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
        }
    },
    // Resolves . and .. elements in a path with directory names
    normalizeStringPosix:function normalizeStringPosix(path, allowAboveRoot) {
        var res = '';
        var lastSegmentLength = 0;
        var lastSlash = -1;
        var dots = 0;
        var code;
        for (var i = 0; i <= path.length; ++i) {
            if (i < path.length)
            code = path.charCodeAt(i);
            else if (code === 47 /*/*/)
            break;
            else
            code = 47 /*/*/;
            if (code === 47 /*/*/) {
            if (lastSlash === i - 1 || dots === 1) {
                // NOOP
            } else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
                if (res.length > 2) {
                    var lastSlashIndex = res.lastIndexOf('/');
                    if (lastSlashIndex !== res.length - 1) {
                    if (lastSlashIndex === -1) {
                        res = '';
                        lastSegmentLength = 0;
                    } else {
                        res = res.slice(0, lastSlashIndex);
                        lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
                    }
                    lastSlash = i;
                    dots = 0;
                    continue;
                    }
                } else if (res.length === 2 || res.length === 1) {
                    res = '';
                    lastSegmentLength = 0;
                    lastSlash = i;
                    dots = 0;
                    continue;
                }
                }
                if (allowAboveRoot) {
                if (res.length > 0)
                    res += '/..';
                else
                    res = '..';
                lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0)
                res += '/' + path.slice(lastSlash + 1, i);
                else
                res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
            } else if (code === 46 /*.*/ && dots !== -1) {
            ++dots;
            } else {
            dots = -1;
            }
        }
        return res;
    },
    joinPath:function(){
        if (arguments.length === 0)
            return '.';
        var joined;
        for (var i = 0; i < arguments.length; ++i) {
            var arg = arguments[i];
            epubjs.assertPath(arg);
            if (arg.length > 0) {
                if (joined === undefined)
                    joined = arg;
                else
                    joined += '/' + arg;
            }
        }
        if (joined === undefined)
            return '.';
        return (function(path){
            epubjs.assertPath(path);

            if (path.length === 0) return '.';
        
            var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
            var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;
        
            // Normalize the path
            path = epubjs.normalizeStringPosix(path, !isAbsolute);
        
            if (path.length === 0 && !isAbsolute) path = '.';
            if (path.length > 0 && trailingSeparator) path += '/';
        
            if (isAbsolute) return '/' + path;
            return path;  
        })(joined);
    },
    // ----

    parse:async function (path) {
        var readerm;
        if(typeof path=='string'){
            readerm = new zip.HttpReader(path);
        }else if(path instanceof Blob){
            readerm = new zip.BlobReader(path);
        }
        var reader = new zip.ZipReader(readerm);
        var entries = await reader.getEntries()
        var contentOpf=await epubjs.getContentOpf(entries);
        var toc=await epubjs.getToc(entries,contentOpf.rootfile);
        contentOpf.toc=toc;
        contentOpf.texts=epubjs.getTexts(entries);
        var dataCache={};
        contentOpf.getData=async function(path){
            if(dataCache[path]){
                return dataCache[path];
            }else{
                var content;
                if(path.indexOf('.jpg')!=-1||path.indexOf('.png')!=-1||path.indexOf('.gif')!=-1||path.indexOf('.jpeg')!=-1||path.indexOf('.webp')!=-1){
                    content=await epubjs.getFile(entries,path).getData(new zip.BlobWriter());
                    content=URL.createObjectURL(content);
                }else{
                    content=await epubjs.getFile(entries,path).getData(new zip.TextWriter());
                }
                dataCache[path]=content;
                return content;
            }
        }
        return contentOpf;
    },
    getContentOpf:async function(entries){
        var root=await epubjs.getFile(entries,'META-INF/container.xml').getData(new zip.TextWriter());
        console.log(root);
        var rootfile=(function(){
            var domparser=new DOMParser();
            var doc=domparser.parseFromString(root,'text/html');
            doc=doc.documentElement;
            var rootf=doc.querySelector('rootfile');
            var r=rootf.getAttribute('full-path')
            return r;
        })();
        var xml=await epubjs.getFile(entries,rootfile).getData(new zip.TextWriter());
        var domparser=new DOMParser();
        var doc=domparser.parseFromString(xml,'text/html');
        doc=doc.documentElement;
        var title=doc.querySelector('dc\\:title').textContent;
        var writer=doc.querySelector('dc\\:creator').textContent;
        var date=doc.querySelector('dc\\:date').textContent;
        var publisher=doc.querySelector('dc\\:publisher').textContent;
        var lang=doc.querySelector('dc\\:language').textContent;
        try {
            var cover=doc.querySelector('#cover').getAttribute('href');
            cover=URL.createObjectURL(await epubjs.getFile(entries,cover).getData(new zip.BlobWriter()));
            var titlepage=doc.querySelector('#titlepage').getAttribute('href');
        } catch (error) {
            
        }
        
        return {
            title:title,
            writer:writer,
            date:date,
            publisher:publisher,
            lang:lang,
            cover:cover,
            titlepage:titlepage,
            rootfile:rootfile.replace('content.opf','')
        };
    },
    getToc:async function(entries,root){
        var xml=await entries.find(function(entry){
            return entry.filename==root+'toc.ncx';
        }).getData(new zip.TextWriter());
        var doc=new DOMParser().parseFromString(xml,'text/html');
        var navmap=doc.querySelector('navmap');
        var toc=g(navmap.childNodes);
        function g(items){
            var toc=[];
            items.forEach(function(item){
                if(item.nodeType==1){
                    var a={};
                    var childNodes=item.childNodes;
                    childNodes.forEach(function(item){
                        if(item.nodeType==1){
                            if(item.tagName=='NAVLABEL'){
                                a.label=item.textContent.trim();
                            }else if(item.tagName=='CONTENT'){
                                var href=item.getAttribute('src').split('#');
                                a.href=href[0];
                                href.shift();
                                a.hash=href.join('#');
                                if(item.querySelector('NAVPOINT')){
                                    a.list=g(item.childNodes);
                                }
                            }
                        } 
                    });
                    toc.push(a);
                }                
             })
             return toc;
        }
        return toc;
    },
    getTexts:function(entries){
        var texts=[];
        entries.forEach(function(entry){
            if(entry.filename.indexOf('.xhtml')!=-1||entry.filename.indexOf('.html')!=-1){
                texts.push(entry.filename);
            }
        });
        return texts;
    },
    getFile:function(entries,path){
        return entries.find(function(entry){
            return entry.filename==path
        })
    },
    show:function(path){
        epubjs.parse(path).then(function(res){
            epubjs.view(res);
        })
    }
}