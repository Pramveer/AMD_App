import { Meteor } from 'meteor/meteor'
import { Email } from 'meteor/email'

Meteor.methods({
    //Method for sending email
    sendEmail: function(mailFields) {

        //check([to, from, subject, text], [String]);
        // console.log("Email sending in progress....1");
        var html = '';
        var selectedTemplate = '';

        switch (mailFields.type) {
            case 1:
                selectedTemplate = 'ForgotPass.html';
                html = "Hello ,<br/><br/> Your password : <strong>" + mailFields.password + " </strong><br/><br/>";
                break;
            case 2:
                selectedTemplate = 'ForgotUser.html';
                html = "Hello ,<br/><br/> Your username : <strong>" + mailFields.username + " </strong><br/><br/>";
                break;
            case 3:
                selectedTemplate = 'ForgotBoth.html';
                html = "Hello ,<br/><br/> Your username : <strong>" + mailFields.username + " </strong><br/><br/> Your password : <strong>" + mailFields.password + "</strong>";
                break;
            case 4:
                selectedTemplate = 'CreateUser.html';
                html = "Hello " + mailFields.firstname + ", <br/>Your Account created successfully. <br/> Your username : <strong>" + mailFields.username + " </strong><br/><br/> Your password : <strong>" + mailFields.password + "</strong>";
                break;
            case 5:
                html = "Hello , <br/>I am facing the below problem with PCP: <br/><strong>" + mailFields.problem + " </strong>";
                break;
            case 6:
                html = "A new request has been submmited for your review from " + mailFields.site + " submmited by " + mailFields.physician;
                break;
        }
        // console.log(html);
        console.log("Email sending in progress....");

        //Commented code because on DEV site package is not downloading

        //name the template name to render server side from private folder
        // SSR.compileTemplate('emailTemplate', Assets.getText(selectedTemplate));

        //var html = SSR.render("emailTemplate", mailFields);

        // Let other method calls from the same client start running,
        // without waiting for the email sending to complete.
        this.unblock();
        //actual email sending method
        Email.send({
            to: mailFields.to,
            from: 'accounts@pinscriptive.com',
            subject: mailFields.subject,
            html: html
        });

        console.log("Email Sent .!");
    },
});