import { Template } from 'meteor/templating';
import './coverMyMeds.html';
import '../../lib/cover-my-meds-api-plugins'; // coverMyMeds plugin reference

Template.CMMDashboard.rendered = function() {

    $(function() {
        // configure API_ID and token_ids before call dashboard method
        var tokenIds = JSON.parse(localStorage.getItem('cmm_plugin_api_token_ids')) || [],
            config = {
                //apiId: 'e7c6hxn22nj9o5uo0skx',//'rr6q9juuelyysacc529d',
                    apiId: 'rr6q9juuelyysacc529d',
                version: 1
            };
        //Added example tokenId in PA Request page to display Pagination
        if (tokenIds.length === 0) {
//Commented dummy token ID, this would be comes from database if we save
            // tokenIds = ["8p9yhrsfog657pue8cbo", "d2mh3vkz6hg2gdv3guf9", "qg1je9uoqyvg8pljw51g", "l511cltghdpima3qh0ck", "znf34d3f0bwa8n5iwjk8", "m7ti609w2sj2ht4ftcsn", "obfy0zkjh2fzkbpotzw9", "ezl0thiqv3uob9nygclu", "iwk6583o4m1v7es1fjxz", "vngf9cavoal7k1of0l2n", "8x4eskhlk4uzwu6lqh8i"];
            // localStorage.setItem('cmm_plugin_api_token_ids', JSON.stringify(tokenIds));
        }
        $('#dashboard').dashboard({
            apiId: config.apiId,
            version: config.version,
            // Search using the stored IDs from earlier, or some defaults if we haven't created any yet
            tokenIds: JSON.parse(localStorage.getItem('cmm_plugin_api_token_ids'))
        });

    });

};

// Template.PADashboard.rendered = function() {

// };
