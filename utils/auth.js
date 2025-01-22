let autenticacio = (req, res, next) => {
    if (req.session && req.session.login)
        return next();
    else
        res.redirect('/auth/login');
};

let rol = (rol) => {
    return (req, res, next) => {
        //TODO
        if (rol.some(r => r === req.session.rol)){
            next();
        }
        else{
            res.redirect('/auth/login');
        }
    }
}

module.exports = {
    autenticacio: autenticacio,
    rol: rol
};