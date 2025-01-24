const User = require(__dirname + '/../models/user.js');

let autenticacio = (req, res, next) => {
    if (req.session && req.session.login)
        return next();
    else
        res.redirect('/auth/login');
};

let rol = (rol) => {
    return async (req, res, next) => {
        if (rol.some(r => r === req.session.rol)){
                    if(req.session.rol === "patient"){

                        const resultat = await User.findById(req.params.id);

                        if(resultat && resultat.login === req.session.login){
                            next();
                        }else{
                            res.redirect('/public/index.html');
                        }
                    }else{
                        next();
                    }
        }else if(req.session.rol === "patient"){
            res.render('error', {error: "No tens accès"});
        }
        else{
            res.render('error', {error: "No tens accès"});
        }
    }
}

module.exports = {
    autenticacio: autenticacio,
    rol: rol
};