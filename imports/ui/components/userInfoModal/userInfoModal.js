import './userInfoModal.html';

Template.UserInfoModal.helpers({
  username : () => {
    let user = JSON.parse(localStorage.getItem('user'));
    console.log(user)
    return user.username || 'notal';
  }
});
