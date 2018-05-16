import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import './PreAuthArchive.html';

var PreauthorizationData = null;
let showPages = 10;

Template.PreAuthArchive.onCreated(function() {
    var self = this;
    this.loading = new ReactiveVar(true);
    this.noData = new ReactiveVar(false);

    var Patientdata = Pinscriptive['Filters'];
    this.autorun(function() {

        let params = {
            patientname: "",
            form: 'PAFormList'
        };

        Meteor.call('getPreAuthorizationFormData', params, function(error, result) {
            if (error) {
                console.log(error);
                self.loading.set(false);
                self.noData.set(true);
            } else {

                let decompressed_object = LZString.decompress(result);
                let resulting_object = JSON.parse(decompressed_object);

                //console.log(resulting_object);
                self.loading.set(false);
                PreauthorizationData = resulting_object.PreauthorizationData;
                $('.searchPatientCountHeader').html(commaSeperatedNumber(PreauthorizationData.length));
            }

        });

    });
});

Template.PreAuthArchive.rendered = function() {

};

Template.PreAuthArchive.helpers({
    'isLoading': function() {
        return Template.instance().loading.get();
    },
    'noDataFound': function() {
        return Template.instance().noData.get();
    },
    'PreauthorizationFormData': function() {
        try {
            var PreauthorizationFormData = PreauthorizationData;
            localStorage.PreauthorizationFormData = JSON.stringify(PreauthorizationFormData);
            if (PreauthorizationFormData.length > showPages) {
                setTimeout(function() {

                    $('.paginationPreAuthArchive .pdl-list').each(function(d) {
                        if ($(this).hasClass('pagepa1') == true) {
                            $(this).show();
                        } else {
                            $(this).hide();
                        }
                    });
                }, 100);
            }
            return PreauthorizationFormData;
        } catch (e) {
            //console.log(e);
        }

    },
    'isPreauthorizationFormDataEmpty': function() {
        if (PreauthorizationData.length > 0)
            return true;
        else
            return false;

    },
    'UploadFilesShow':function(data){
      let jdata = JSON.parse(data);
      let html = '';
      if(jdata && jdata.length>0){
        // html += '<ul class="downloadFileLink" style="list-style:none;float:left">';
        // for(let i = 0 ;i<jdata.length;i++){
        //   html +=  `<li type="${jdata[i].type}" name="${jdata[i].name}" data="${jdata[i].dataUrl}">${jdata[i].name}</li>`;
        // }
        // html += '</ul>';
        for(let i = 0 ;i<jdata.length;i++){
          html += jdata[i].name+';';
        }
      }
      return html;
    },
    'isHavePaging': function(pValue) {
        if (pValue && parseInt(pValue) > showPages) {
            return true;
        } else {
            return false;
        }
    },
    'Paging': function(pValue) {
        let pValueTotal = JSON.parse(localStorage.PreauthorizationFormData).length;
        let page_number = pValue / showPages;
        if (pValue % showPages == 0) {
            page_number = pValue / showPages;
        } else {
            page_number = pValue / showPages;
            page_number = parseInt(page_number) + 1;
        }

        if (pValue && parseInt(pValue) <= pValueTotal) {
            return 'pagepa' + page_number;
        } else {
            //return 'page1';
        }
    },
    'isPageFirst': function(pValue) {
        if (pValue == 1) {
            return true;
        } else {
            return false;
        }
    },
    'PaginationPages': function() {
        let pValue = JSON.parse(localStorage.PreauthorizationFormData).length;
        let pages = [];
        let page_numbers = pValue / showPages;
        if (pValue % showPages == 0) {
            page_numbers = pValue / showPages;
        } else {
            page_numbers = pValue / showPages;
            page_numbers = parseInt(page_numbers) + 1;
        }

        for (let i = 1; i <= parseInt(page_numbers); i++) {
            pages.push({
                'pageno': i
            });
        }
        return pages;
    },
    'maskedData': function(datavalue) {
        if (datavalue != null) {
            if (datavalue.data[0] == 1)
                return "Yes";
            else
                return "No";
        }
    }
});


Template.PreAuthArchive.events({
    'click .js-providerSubtabs-links': function(e, template) {
        let tabData = $(e.currentTarget).children('a').attr('data');
        e.preventDefault();
        //set provider subtab data link
        Session.set('provider_subtab', tabData);
        Router.go('Provider');
    },
    // Nisha 02/13/2017 Click event for the Pre Authorizaton form
    'click .pro_rightsideimg': function(e) {
        Router.go('Provider/PreAuthorization');
    },
     // Jayesh 02/17/2017 Click event for P & T Model
     'click .ptModelButton': function(e) {
        Router.go('Provider/PTmodel');
    },
    'click .sed-emrnumber': function(event, template) {
        let patientID = $(event.currentTarget).children('div').html();
        // console.log(patientID);
        Router.go('/Provider/PreAuthorization/' + patientID);
    },
    'click #btnSearch': function(event, template) {

        let params = {
            patientname: $("#PatientName").val(),
            form: 'PAFormList'
        };

        template.loading.set(true);
        Meteor.call('getPreAuthorizationFormData', params, function(error, result) {
            if (error) {
                template.loading.set(false);
                template.noData.set(true);
            } else {

                let decompressed_object = LZString.decompress(result);
                let resulting_object = JSON.parse(decompressed_object);

                //console.log(resulting_object);
                template.loading.set(false);
                PreauthorizationData = resulting_object.PreauthorizationData;
                $('.searchPatientCountHeader').html(commaSeperatedNumber(PreauthorizationData.length));
            }

        });
    },
    'click div.preauthorizationformdata ul > li.numpg': function(event, template) {
        let page_number = parseInt($(event.currentTarget).html());
        let pValue = JSON.parse(localStorage.PreauthorizationFormData).length;
        let page_numbers = pValue / showPages;
        if (pValue % showPages == 0) {
            page_numbers = pValue / showPages;
        } else {
            page_numbers = pValue / showPages;
            page_numbers = parseInt(page_numbers) + 1;
        }
        if (page_number == 1) {
            $('li.pgpa-prevpa').addClass('disable');
            $('li.pgpa-nextpa').removeClass('disable');
        }

        if (page_number == page_numbers) {
            $('li.pgpa-prevpa').removeClass('disable');
            $('li.pgpa-nextpa').addClass('disable');
        }

        if (page_number != page_numbers && page_number != 1) {
            $('li.pgpa-prevpa').removeClass('disable');
            $('li.pgpa-nextpa').removeClass('disable');
        }
        $('div.preauthorizationformdata ul > li').each(function(d) {
            if (!isNaN(parseInt($(this).html()))) {
                if (parseInt($(this).html()) == page_number) {
                    $(this).addClass('active');
                } else {
                    $(this).removeClass('active');
                }
            }
        });

        $('.paginationPreAuthArchive .pdl-list').each(function(d) {
            if ($(this).hasClass('pagepa' + page_number) == true) {
                $(this).show();
            } else {
                $(this).hide();
            }
            //console.log($(this).html());
        });

    },
    'click div.preauthorizationformdata ul > li.pgpa-nextpa ': function(event, template) {
        // $('.page1').hide();
        // $('.page2').show();
        // $('li.pg1').removeClass('active');
        // $('li.pg2').addClass('active');
        // $('li.pgpa-prevpa').removeClass('disable');
        // $('li.pgpa-nextpa').addClass('disable');

        let pValue = JSON.parse(localStorage.PreauthorizationFormData).length;
        let page_numbers = pValue / showPages;
        if (pValue % showPages == 0) {
            page_numbers = pValue / showPages;
        } else {
            page_numbers = pValue / showPages;
            page_numbers = parseInt(page_numbers) + 1;
        }
        let page_number = 0;
        $('div.preauthorizationformdata ul > li.numpg').each(function(d) {
            if ($(this).hasClass('active') == true) {
                page_number = parseInt($(this).html());
                if (page_number != page_numbers)
                    $(this).removeClass('active');
            }
        });
        if ($('li.pgpa-nextpa').hasClass('disable') == false) {
            $('.pgpa' + (page_number + 1)).addClass('active');
            $('.pagepa' + (page_number + 1)).show();
            $('.pagepa' + (page_number)).hide();
        }



        if (page_number + 1 == page_numbers) {
            $('li.pgpa-prevpa').removeClass('disable');
            $('li.pgpa-nextpa').addClass('disable');
            $('.pgpa' + (page_number + 1)).addClass('active');

        }

        if (page_number != page_numbers) {
            $('li.pgpa-prevpa').removeClass('disable');
            $('paginationPreAuthArchive .pdl-list').each(function(d) {
                if ($(this).hasClass('pagepa' + (page_number + 1)) == true) {
                    $(this).show();
                } else {

                    $(this).hide();
                }
                //console.log($(this).html());
            });
        }
    },
    'click div.preauthorizationformdata ul > li.pgpa-prevpa ': function(event, template) {

        // $('.page2').hide();
        // $('.page1').show();
        // $('li.pg2').removeClass('active');
        // $('li.pg1').addClass('active');
        // $('li.pgpa-prevpa').addClass('disable');
        // $('li.pgpa-nextpa').removeClass('disable');
        let pValue = JSON.parse(localStorage.PreauthorizationFormData).length;
        let page_numbers = pValue / showPages;
        if (pValue % showPages == 0) {
            page_numbers = pValue / showPages;
        } else {
            page_numbers = pValue / showPages;
            page_numbers = parseInt(page_numbers) + 1;
        }
        let page_number = 0;
        $('div.preauthorizationformdata ul > li.numpg').each(function(d) {
            if ($(this).hasClass('active') == true) {
                page_number = parseInt($(this).html());
                if (page_number != 1)
                    $(this).removeClass('active');
            }
        });
        if ($('li.pgpa-prevpa').hasClass('disable') == false)
            $('.pgpa' + (page_number - 1)).addClass('active');



        if (page_number - 1 == 1) {
            $('li.pgpa-prevpa').addClass('disable');
            $('li.pgpa-nextpa').removeClass('disable');
            $('.pgpa' + (page_number - 1)).addClass('active');
        } else if (page_number != 1) {
            $('li.pgpa-nextpa').removeClass('disable');
            $('.paginationPreAuthArchive .pdl-list').each(function(d) {
                if ($(this).hasClass('pagepa' + (page_number - 1)) == true) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
                //console.log($(this).html());
            });
        }
    },
    'click .downloadFileLink li':function(e,template){
        e.preventDefault();
        let type = $(e.currentTarget).attr('type');
        let name = $(e.currentTarget).attr('name');
        let data = $(e.currentTarget).attr('data');
        //downloadFile({type:type,name:name,dataUrl:data});
        download(data,name,type);
    }
});

function download(data, strFileName, strMimeType) {

        var self = window, // this script is only for browsers anyway...
            defaultMime = "application/octet-stream", // this default mime also triggers iframe downloads
            mimeType = strMimeType || defaultMime,
            payload = data,
            url = !strFileName && !strMimeType && payload,
            anchor = document.createElement("a"),
            toString = function(a){return String(a);},
            myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString),
            fileName = strFileName || "download",
            blob,
            reader;
            myBlob= myBlob.call ? myBlob.bind(self) : Blob ;

        if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
            payload=[payload, mimeType];
            mimeType=payload[0];
            payload=payload[1];
        }


        if(url && url.length< 2048){ // if no filename and no mime, assume a url was passed as the only argument
            fileName = url.split("/").pop().split("?")[0];
            anchor.href = url; // assign href prop to temp anchor
            if(anchor.href.indexOf(url) !== -1){ // if the browser determines that it's a potentially valid url path:
                var ajax=new XMLHttpRequest();
                ajax.open( "GET", url, true);
                ajax.responseType = 'blob';
                ajax.onload= function(e){
                  download(e.target.response, fileName, defaultMime);
                };
                setTimeout(function(){ ajax.send();}, 0); // allows setting custom ajax headers using the return:
                return ajax;
            } // end if valid url?
        } // end if url?


        //go ahead and download dataURLs right away
        if(/^data\:[\w+\-]+\/[\w+\-]+[,;]/.test(payload)){

            if(payload.length > (1024*1024*1.999) && myBlob !== toString ){
                payload=dataUrlToBlob(payload);
                mimeType=payload.type || defaultMime;
            }else{
                return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
                    navigator.msSaveBlob(dataUrlToBlob(payload), fileName) :
                    saver(payload) ; // everyone else can save dataURLs un-processed
            }

        }//end if dataURL passed?

        blob = payload instanceof myBlob ?
            payload :
            new myBlob([payload], {type: mimeType}) ;


        function dataUrlToBlob(strUrl) {
            var parts= strUrl.split(/[:;,]/),
            type= parts[1],
            decoder= parts[2] == "base64" ? atob : decodeURIComponent,
            binData= decoder( parts.pop() ),
            mx= binData.length,
            i= 0,
            uiArr= new Uint8Array(mx);

            for(i;i<mx;++i) uiArr[i]= binData.charCodeAt(i);

            return new myBlob([uiArr], {type: type});
         }

        function saver(url, winMode){

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
                    if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(anchor.href);}, 250 );}
                }, 66);
                return true;
            }

            // handle non-a[download] safari as best we can:
            if(/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
                url=url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
                if(!window.open(url)){ // popup blocked, offer direct download:
                    if(confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")){ location.href=url; }
                }
                return true;
            }

            //do iframe dataURL download (old ch+FF):
            var f = document.createElement("iframe");
            document.body.appendChild(f);

            if(!winMode){ // force a mime that will download:
                url="data:"+url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
            }
            f.src=url;
            setTimeout(function(){ document.body.removeChild(f); }, 333);

        }//end saver




        if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
            return navigator.msSaveBlob(blob, fileName);
        }

        if(self.URL){ // simple fast and modern way using Blob and URL:
            saver(self.URL.createObjectURL(blob), true);
        }else{
            // handle non-Blob()+non-URL browsers:
            if(typeof blob === "string" || blob.constructor===toString ){
                try{
                    return saver( "data:" +  mimeType   + ";base64,"  +  self.btoa(blob)  );
                }catch(y){
                    return saver( "data:" +  mimeType   + "," + encodeURIComponent(blob)  );
                }
            }

            // Blob but not URL support:
            reader=new FileReader();
            reader.onload=function(e){
                saver(this.result);
            };
            reader.readAsDataURL(blob);
        }
        return true;
    }; /* end download() */
