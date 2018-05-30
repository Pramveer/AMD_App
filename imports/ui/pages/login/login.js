import './login.html';

Template.login.events({
      'submit form': function (e) {
        e.preventDefault();
        // alert('hii')
        var user = $('#user').val().trim().toLowerCase(),
            pass = $('#password').val();
            var obj = {'user':user, 'password': pass};
            console.log(obj);
            if (user && pass) {
              Meteor.call('ValidateUser',user , pass, (err, res) => {
                console.log(res)
              });
              alert('hii');
              let obj = {
                'user': user,
                'token': pass
              };
              localStorage.setItem('user',JSON.stringify(obj));
              Router.go('/')
            }
      }
})
