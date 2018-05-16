
    // // Set email parameter from setting file
    //     var smtp = {
    //         username: Meteor.settings.private.Email.username,
    //         password: Meteor.settings.private.Email.password,
    //         server: Meteor.settings.private.Email.server,
    //         port: Meteor.settings.private.Email.port
    //     };

    var smtp = {
        username: 'accounts@pinscriptive.com',
        password: 'BigData1',
        server: 'secure.emailsrvr.com',
        port: 465
    }


    process.env.MAIL_URL = "smtp://" + encodeURIComponent(smtp.username) + ":" +
        encodeURIComponent(smtp.password) + "@" + encodeURIComponent(smtp.server) +
        ":" + smtp.port;
        console.log("*** Application Restarted ***");