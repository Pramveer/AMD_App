import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';

import './customUploadForScreening.html';

Template.customUploadForScreening.created = function() {
    // set unique number which will be used for entire template to identify control
    //Modifed by Praveen 04/06/2017
    //generatedDynamicId = Meteor.uuid();//new Date().getTime();
    let self = this;
    let id = Meteor.uuid();
    this.generatedDynamicId = new ReactiveVar(id);
}

Template.customUploadForScreening.rendered = function() {
    //Session.set('UploadedScreeingFiles' + generatedDynamicId, []);
};
Template.customUploadForScreening.helpers({
    'generateDynamicId': function() {
        return Template.instance().generatedDynamicId.get();
    },
    'parentId': function() {
        return Template.instance().data;
    }
});
Template.customUploadForScreening.events({
    'click .upload_btn': function(event, template) {
        event.preventDefault();
        if (event.currentTarget.attributes['data-control-id']) {
            let controlId = event.currentTarget.attributes['data-control-id'].value;
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                _.each(template.find('#files-' + controlId).files, function(file) {
                    if (file.size > 1) {
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            let filesL = Session.get('UploadedScreeingFiles' + controlId) || [];
                            let len = 0;
                            filesL.sort((a, b) => a.id - b.id);
                            if (filesL.length > 1) {
                                len = filesL[filesL.length - 1]['id'] == undefined ? filesL.length : filesL[filesL.length - 1]['id'];
                            }
                            if (filesL.length == 1) {
                                len = filesL[0]['id'];
                            }

                            let d = {
                                name: file.name,
                                type: file.type,
                                dataUrl: reader.result,
                                id: len + 1,
                                controlId: controlId
                            };
                            //download(reader.result,d.name,d.type);
                            filesL.push(d);
                            Session.set('UploadedScreeingFiles' + controlId, filesL);
                            showFileList(controlId);
                            //console.log(d);
                        }
                        reader.readAsDataURL(file);
                    }
                });
            }
            showFileList(controlId);
        }
    },
    //popup close
    'click .analytics_closebtn': function() {
        $('.analyticsPatientsPopup').hide();
    },
    'change input[type=file]': function(e, template) {
        let controlId = e.currentTarget.id.replace("files-", "");
        //let controlId = event.currentTarget.attributes['data-control-id'].value;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            _.each(template.find('#files-' + controlId).files, function(file) {
                if (file.size > 1) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        let filesL = Session.get('UploadedScreeingFiles' + controlId) || [];
                        let len = 0;
                        filesL.sort((a, b) => a.id - b.id);
                        if (filesL.length > 1) {
                            len = filesL[filesL.length - 1]['id'] == undefined ? filesL.length : filesL[filesL.length - 1]['id'];
                        }
                        if (filesL.length == 1) {
                            len = filesL[0]['id'];
                        }

                        let d = {
                            name: file.name,
                            type: file.type,
                            dataUrl: reader.result,
                            id: len + 1,
                            controlId: controlId
                        };
                        //download(reader.result,d.name,d.type);
                        filesL.push(d);
                        Session.set('UploadedScreeingFiles' + controlId, filesL);
                        showFileList(controlId);
                        //console.log(d);
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
        showFileList(controlId);
    }
});

function removeastriks(controlId) {
    let parentclass = $("#custom-upload-" + controlId).parent().parent().parent().parent().attr("class");
    // console.log(parentclass);
    let filelisting = $("#file-listing-" + controlId + " li").length;
    if (parentclass === 'pcp-eval-hepa') {
        if (filelisting > 0) {
            $('.pcp-eval-hepa .asterik').hide();
            $('.pcp-eval-hepa [id^=diverror]').hide();
        }
    } else if (parentclass === 'pcp-eval-labresults') {
        if (filelisting > 0) {
            $('.pcp-eval-labresults .asterik').hide();
            $('.pcp-eval-labresults [id^=diverror]').hide();
        }
    }
}

function showFileList(controlId) {
    let fileList = Session.get('UploadedScreeingFiles' + controlId);
    let html = ``;
    if (fileList && fileList.length > 0) {
        $('#display-' + controlId).show();
        console.log("test");
        fileList.forEach(function(value, index) {
            html += `<li type="${value.type}" name="${value.name}" 
            data-control-id="${controlId}" style="float:left;margin-right:10px;">${value.name}</li>
        <button class="deleteUploadedFile" id="deleteUploadedFile-${controlId}" data-control-id="${controlId}" data="${value.id}">X</button><br/> `
        });
        $('#file-listing-' + controlId).html(html);
        removeastriks(controlId);
        $('#file-listing-' + controlId + ' li').on('click', function(e) {
            e.preventDefault();
            if (e.currentTarget.attributes['data-control-id']) {
                let controlId = e.currentTarget.attributes['data-control-id'].value;

                let type = $(e.currentTarget).attr('type');
                let name = $(e.currentTarget).attr('name');
                // let data = $(e.currentTarget).attr('data');
                //downloadFile({type:type,name:name,dataUrl:data});
                // $("#dialog").dialog({
                //   modal:true
                // });
                let fileList = _.where(Session.get('UploadedScreeingFiles' + controlId), {
                    name: name,
                    type: type
                });
                if (fileList && fileList.length > 0) {
                    $('#frame-' + controlId.trim()).attr("src", fileList[0].dataUrl);
                    //    Nisha 04/12/2017 updated to hide the popup 
                    //$('.analyticsPatientsPopup').show();
                    //console.log(fileList[0].dataUrl);
                    download(fileList[0].dataUrl, name, type);
                }
            }
        });
        $('#file-listing-' + controlId + ' .deleteUploadedFile').on('click', function(e) {
            e.preventDefault();
            if (e.currentTarget.attributes['data-control-id']) {
                let controlId = e.currentTarget.attributes['data-control-id'].value;

                let data = Session.get('UploadedScreeingFiles' + controlId);
                let filename = $(e.currentTarget).attr('data');
                let sdata = [];
                for (let i = 0; i < data.length; i++) {
                    let filen = data[i].id;
                    if (filename && filen != filename) {
                        sdata.push(data[i]);
                    }
                }
                if (filename)
                    Session.set('UploadedScreeingFiles' + controlId, sdata);
                showFileList(controlId);
            }

            //console.log('deleteUploadedFile');
            var itemid = e.currentTarget.id.replace("deleteUploadedFile", "#custom-upload");
            let parentclass = $(itemid).parent().parent().parent().parent().attr("class");
            // console.log(parentclass);
            let filelisting = $("#file-listing-" + controlId + " li").length;
            //console.log(mailitemid);


            if (parentclass === 'pcp-eval-hepa') {
                if (filelisting <= 0)
                    $('.pcp-eval-hepa .asterik').show();
            } else if (parentclass === 'pcp-eval-labresults') {
                if (filelisting <= 0)
                    $('.pcp-eval-labresults .asterik').show();
            }

        });
    } else {
        $('#display-' + controlId).hide();
        $('#file-listing-' + controlId).html('No Files Uploaded');
    }
}





function download(data, strFileName, strMimeType) {

    var self = window, // this script is only for browsers anyway...
        defaultMime = "application/octet-stream", // this default mime also triggers iframe downloads
        mimeType = strMimeType || defaultMime,
        payload = data,
        url = !strFileName && !strMimeType && payload,
        anchor = document.createElement("a"),
        toString = function(a) {
            return String(a);
        },
        myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString),
        fileName = strFileName || "download",
        blob,
        reader;
    myBlob = myBlob.call ? myBlob.bind(self) : Blob;

    if (String(this) === "true") { //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
        payload = [payload, mimeType];
        mimeType = payload[0];
        payload = payload[1];
    }


    if (url && url.length < 2048) { // if no filename and no mime, assume a url was passed as the only argument
        fileName = url.split("/").pop().split("?")[0];
        anchor.href = url; // assign href prop to temp anchor
        if (anchor.href.indexOf(url) !== -1) { // if the browser determines that it's a potentially valid url path:
            var ajax = new XMLHttpRequest();
            ajax.open("GET", url, true);
            ajax.responseType = 'blob';
            ajax.onload = function(e) {
                download(e.target.response, fileName, defaultMime);
            };
            setTimeout(function() {
                ajax.send();
            }, 0); // allows setting custom ajax headers using the return:
            return ajax;
        } // end if valid url?
    } // end if url?


    //go ahead and download dataURLs right away
    if (/^data\:[\w+\-]+\/[\w+\-]+[,;]/.test(payload)) {

        if (payload.length > (1024 * 1024 * 1.999) && myBlob !== toString) {
            payload = dataUrlToBlob(payload);
            mimeType = payload.type || defaultMime;
        } else {
            return navigator.msSaveBlob ? // IE10 can't do a[download], only Blobs:
                navigator.msSaveBlob(dataUrlToBlob(payload), fileName) :
                saver(payload); // everyone else can save dataURLs un-processed
        }

    } //end if dataURL passed?

    blob = payload instanceof myBlob ?
        payload :
        new myBlob([payload], {
            type: mimeType
        });


    function dataUrlToBlob(strUrl) {
        var parts = strUrl.split(/[:;,]/),
            type = parts[1],
            decoder = parts[2] == "base64" ? atob : decodeURIComponent,
            binData = decoder(parts.pop()),
            mx = binData.length,
            i = 0,
            uiArr = new Uint8Array(mx);

        for (i; i < mx; ++i) uiArr[i] = binData.charCodeAt(i);

        return new myBlob([uiArr], {
            type: type
        });
    }

    function saver(url, winMode) {

        if ('download' in anchor) { //html5 A[download]
            anchor.href = url;
            anchor.setAttribute("download", fileName);
            anchor.className = "download-js-link";
            anchor.innerHTML = "downloading...";
            anchor.style.display = "none";
            document.body.appendChild(anchor);
            setTimeout(function() {
                anchor.click();
                document.body.removeChild(anchor);
                if (winMode === true) {
                    setTimeout(function() {
                        self.URL.revokeObjectURL(anchor.href);
                    }, 250);
                }
            }, 66);
            return true;
        }

        // handle non-a[download] safari as best we can:
        if (/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
            url = url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
            if (!window.open(url)) { // popup blocked, offer direct download:
                if (confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")) {
                    location.href = url;
                }
            }
            return true;
        }

        //do iframe dataURL download (old ch+FF):
        var f = document.createElement("iframe");
        document.body.appendChild(f);

        if (!winMode) { // force a mime that will download:
            url = "data:" + url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
        }
        f.src = url;
        setTimeout(function() {
            document.body.removeChild(f);
        }, 333);

    } //end saver




    if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
        return navigator.msSaveBlob(blob, fileName);
    }

    if (self.URL) { // simple fast and modern way using Blob and URL:
        saver(self.URL.createObjectURL(blob), true);
    } else {
        // handle non-Blob()+non-URL browsers:
        if (typeof blob === "string" || blob.constructor === toString) {
            try {
                return saver("data:" + mimeType + ";base64," + self.btoa(blob));
            } catch (y) {
                return saver("data:" + mimeType + "," + encodeURIComponent(blob));
            }
        }

        // Blob but not URL support:
        reader = new FileReader();
        reader.onload = function(e) {
            saver(this.result);
        };
        reader.readAsDataURL(blob);
    }
    return true;
}; /* end download() */

GlobaldeleteAllfile = function(controlId) {
    Session.set('UploadedScreeingFiles' + controlId, []);
    showFileList(controlId);
    $("#files-" + controlId).val('');
}