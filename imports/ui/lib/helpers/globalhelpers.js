Template.registerHelper('currentuser', () => {
    let user = JSON.parse(localStorage.getItem('user'));
    console.log(user)
    return user ? true : false;
});
