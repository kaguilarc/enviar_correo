'use strict';
const peticion_registro = require('../peticiones_registro/peticiones_registro.model');
const nodeMailer = require("nodemailer");//instalar esta dependencia
const institucionModel = require('./instituciones.model');

/**
 * credenciales del correo electronico
 * */
const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cenfochocolate@gmail.com',
        pass: 'xxxxxxxxxxxx'
    }
});




module.exports.registrar = function (req, res) {
    /**
     * modelo
     */
    let nuevaInstitucion = new institucionModel({
        cedula: req.body.cedula,
        nombre: req.body.nombre,
        nombre_comercial: req.body.nombre_comercial,
        anio_funadacion: req.body.anio_fundacion,
        grado: req.body.grado,
        clase: req.body.clase,
        genero: req.body.genero,
        especialidad: req.body.especialidad,
        refencia_historica: req.body.refencia_historica,
        provincia: req.body.provincia,
        canton: req.body.canton,
        distrito: req.body.distrito,
        direccion: req.body.direccion,
        correo: req.body.correo,
        telefono: req.body.telefono,
        extencion_telefono: req.body.extencion_telefono,
        fax: req.body.fax,
        web: req.body.web,
        url_archivo: req.body.url_archivo,
        url_foto: req.body.url_foto,
        aprobada: false
    });

    /**
     * Funcion que nos permite saver si ya la institucion se encuentra registrada
     * pasa por parametro  el numero de cedula*
     */
    institucionModel.findOne({ cedula: req.body.cedula }).then(
        /**
         *crea una funcion resultado de la busqueda  
         */
        function (institucion) {
            /**
             * si devulve la insticion quiere decir que esta ya se encuentra registrada
             * por lo tanto se devuelve el json indicandolo
             */
            if (institucion) {
                res.json({
                    success: false,
                    msj: 'La cédula ' + req.body.cedula + ' ya se encuentra registrada'
                });
                /**
                 * Sino, entonces quiere decir que la insticion no se encuentra registrada
                 * ...procede a guardarla
                 * dentro de esa función tambien se devuelven json, en caso de exito o error
                 */
            } else {
                
                /**
                 * generamos un codigo de manera aleatoria
                 * */
                
                const codigo_registro = Math.trunc(Math.random() * (0, 999999));

                /**
                 * Guaramos la institucion
                 */
                nuevaInstitucion.save(function (error) {

                    if (error) {//ocurrio un error
                        res.json({
                            success: false,
                            msj: 'La institucion no pudo ser registrada: ' + error
                        });
                    } else {//no ocurrio nigun error la variable error viene null

                        /**
                         * Si la institucion se guarda correctamente procedemos a guardar
                         * el codigo en la base de datos
                         * 
                         * 1. creamos el modelo
                         * */
                        
                        
                        let nuevaPeticion = new peticion_registro({
                            cedula_compania: req.body.cedula,
                            codigo: codigo_registro
                        });

                        /**
                         * Guardamos el modelo
                         */
                        nuevaPeticion.save(function (error) {

                            if (error) {//no se pudo guardar
                                res.json({
                                    success: false,
                                    msj: 'No se pudo enviar el c\u00D3digo ' + error
                                });
                            } else {

                                /**
                                 * El modelo se guardo, procedemos a enviar el correo
                                 * */
                                
                                let mailOptions = {
                                    from: 'cenfochocolate@gmail.com',
                                    to: nuevaInstitucion.correo,
                                    subject: 'confirmación de Registro',
                                    html: `<html>
                           <span>el codigo de confirmacion es el ${codigo_registro}</span>
                           </html>`

                                };

                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        //console.log('dsdsdfdsfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
                                        console.log(error);
                                    } else {
                                       // console.log('correo enviado correctamente' + nuevaInstitucion.correo);
                                    }
                                });


                            }

                        });


                        res.json({
                            success: true,
                            msj: 'La institucion ha sido registrada de forma exitosa'
                        });

                    }
                });
            }
        }
    )

};
/**
 * Funcion para listar datos
 * @param {any} req
 * @param {any} res
 */
module.exports.listar_instituciones = function (req, res) {
    /**
     * Funcion de mongo que busca todos los modelos institucion
     */
    institucionModel.find().then(
        /**
         * Si encuentra instituciones las vuelve 
         * sino devuelve mensaje indicando que no
         * @param {any} instituciones
         */
        function (instituciones) {
            if (instituciones.length > 0) {

                res.json({
                    success: true,
                    instituciones: instituciones
                })

            } else {
                res.json({
                    success: false,
                    instituciones: 'No se encontro instituciones'
                })
            }
        }
    )
};



'use strict';

let mongoose = require('mongoose');

let peticion_registroSchema = new mongoose.Schema({
    cedula_compania: { type: String, requerid: true },
    codigo: { type: String, required: true },
    fecha_peticion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Peticion Registro', peticion_registroSchema);



