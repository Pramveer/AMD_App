import './login.html';

Template.login.events({
      'submit form': function (e) {
        e.preventDefault();
        var user = $('#user').val().trim().toLowerCase(),
            pass = $('#password').val();
       if (user && pass) {
          Meteor.call('ValidateUser',user , pass, (err, res) => {
          //  console.log(res)
            if (err) {
            //  console.log(err)
            } else if (res.isValid) {
              //  console.log(res)

                alertify.success(res.message);

                localStorage.setItem('user',JSON.stringify(res.response));
                Router.go('/')
             } else {
               alertify.alert('Please enter correct username/password');
             }

          });
        }
      }
})
