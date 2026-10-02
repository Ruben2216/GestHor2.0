import crypto from 'crypto';


export const generarTokenAcceso = () => {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%&*';
    let token = '';
    
    for (let i = 0; i < 8; i++) {
        const indice = crypto.randomInt(0, caracteres.length);
        token += caracteres[indice];
    }
    
    return token;
};
