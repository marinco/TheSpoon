//<editor-fold desc="React">
import React, {Component} from "react";
//</editor-fold>
//<editor-fold desc="Redux">
import {connect} from "react-redux";
//</editor-fold>
//<editor-fold desc="RxJs">
import {bindCallback, of, throwError} from "rxjs";
import {ajax} from "rxjs/ajax";
import {catchError, exhaustMap, map, take} from "rxjs/operators";
//</editor-fold>
//<editor-fold desc="Bootstrap">
import {Modal} from "react-bootstrap";
//</editor-fold>
//<editor-fold desc="Validator">
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Button from "react-validation/build/button";
import Textarea from "react-validation/build/textarea";
import FormValidator from "../../../validation/FormValidator";
//</editor-fold>

//<editor-fold desc="Constants">
import {paths} from "../../../constants/paths";
import {timeout} from "../../../constants/timeout";
//</editor-fold>
//<editor-fold desc="Icons">
import {IconExit} from "../../Icons";

//</editor-fold>


class EditMenuModal extends Component {

    //<editor-fold desc="Constructor">
    constructor(props) {
        super(props);

        //<editor-fold desc="Validator">
        this.validator = new FormValidator([{
            field: "name",
            method: "isEmpty",
            validWhen: false,
            message: "Name is required."
        }, /*{
            field: "name",
            method: "isAlphanumeric",
            validWhen: true,
            message: "Name is required to be alphanumeric."
        },*/ {
            field: "name",
            method: (name) => {
                return name.length >= 1;
            },
            validWhen: true,
            message: "Name is required to be longer or equal 1 characters."
        }, {
            field: "description",
            method: "isEmpty",
            validWhen: false,
            message: "Description name is required."
        }, /*{
            field: "description",
            method: "isAlphanumeric",
            validWhen: true,
            message: "Description is required to be alphanumeric."
        },*/ {
            field: "description",
            method: (description) => {
                return description.length >= 1;
            },
            validWhen: true,
            message: "Description is required to be longer or equal 1 characters."
        }, {
            field: "tags",
            method: "isEmpty",
            validWhen: false,
            message: "Tags are required."
        }, /*{
            field: "tags",
            method: "isAlphanumeric (plus comma)",
            validWhen: true,
            message: "Tags are required to be alphanumeric."
        },*/ {
            field: "tags",
            method: (tags) => {
                return tags.split(",")
                    .map((tag) => {
                        return tag.trim();
                    })
                    .map((tag) => {
                        return tag.length >= 1;
                    })
                    .reduce((total, minLength) => {
                        return total && minLength;
                    }, true)
            },
            validWhen: true,
            message: "Each tag is required to be longer or equal 1 characters."
        }]);
        //</editor-fold>

        //<editor-fold desc="Handler Function Registration">
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        //</editor-fold>

        this.state = {
            token: window.localStorage.getItem("token"),
            validation: this.validator.valid(),
            serverMessage: "",
            submitted: false,
            //<editor-fold desc="Menu States">
            name: this.props.menu.name,
            description: this.props.menu.description,
            tags: this.props.menu.tags.map((tag) => {
                return tag.name + ", "
            }).reduce((total, tagName) => {
                return total + tagName
            }).slice(0, -2)

            //</editor-fold>
        };
    }

    //</editor-fold>

    //<editor-fold desc="Bussiness Logic">
    handleSubmit = (event) => {
        event.preventDefault();
        const thisTemp = this;
        of(1)
            .pipe(map(() => {
                return thisTemp.form.getValues();
            }), catchError(error => {
                return error;
            }))
            .pipe(exhaustMap((values) => {
                return bindCallback(thisTemp.setState).call(thisTemp, {
                    name: values.name,
                    description: values.description,
                    tags: values.tags.split(",").map(tag => tag.trim())
                });
            }), catchError(error => {
                return error;
            }))
            .pipe(exhaustMap(() => {
                return bindCallback(thisTemp.setState).call(thisTemp, {
                    validation: thisTemp.validator.validate(thisTemp.state),
                    submitted: true,
                    serverMessage: ""
                });
            }), catchError(error => {
                return error;
            }))
            .pipe(exhaustMap(() => {
                if (thisTemp.state.validation.isValid) {
                    thisTemp.setState({serverMessage: "Menu is edited"});
                    return ajax({
                        url: paths["restApi"]["menu"] + "/"
                            + this.props.menu.menuID,
                        method: "PUT",
                        headers: {"Content-Type": "application/json", "X-Auth-Token": this.state.token},
                        body: {
                            name: thisTemp.state.name,
                            description: thisTemp.state.description,
                            tags: thisTemp.state.tags
                        },
                        timeout: timeout,
                        responseType: "text"
                    })
                } else {
                    return throwError({
                        name: "InternalError",
                        status: 0,
                        response: null
                    });
                }
            }), catchError(error => {
                return error;
            }))
            .pipe(take(1))
            .subscribe(
                () => {
                    thisTemp.props.backgroundPage.update();
                    thisTemp.props.onHide();
                }, (error) => {
                    switch (error.name) {
                        case "AjaxTimeoutError":
                            thisTemp.setState({serverMessage: "The request timed out."});
                            break;
                        case "InternalError":
                        case "AjaxError":
                            if (error.status === 0 && error.response === "") {
                                thisTemp.setState({serverMessage: "There is no connection to the server."});
                            } else {
                                thisTemp.setState({serverMessage: error.response});
                            }
                            break;
                        default:
                            console.log(error);
                            thisTemp.setState({serverMessage: "Something is not like it is supposed to be."});
                            break;
                    }
                }
            );
    };

    handleDelete = (event) => {
        event.preventDefault();
        const thisTemp = this;
        of(1)
            .pipe(exhaustMap(() => {
                return ajax({
                    url: paths["restApi"]["menu"] + "/" + this.props.currentMenu.menuID,
                    method: "DELETE",
                    headers: {"Content-Type": "application/json", "X-Auth-Token": this.state.token},
                })
            }), catchError(error => {
                return error;
            }))
            .pipe(take(1))
            .subscribe(
                () => {
                    thisTemp.props.backgroundPage.update();
                    thisTemp.props.onHide();
                }, (error) => {
                    switch (error.name) {
                        case "AjaxTimeoutError":
                            thisTemp.setState({serverMessage: "The request timed out."});
                            break;
                        case "InternalError":
                        case "AjaxError":
                            if (error.status === 0 && error.response === "") {
                                thisTemp.setState({serverMessage: "No connection to the server."});
                            } else {
                                thisTemp.setState({serverMessage: error.response});
                            }
                            break;
                        default:
                            console.log(error);
                            thisTemp.setState({serverMessage: "Something is not like it is supposed to be."});
                            break;
                    }
                }
            );
    };

    //</editor-fold>

    //<editor-fold desc="Render">
    render() {
        let validation = this.submitted ? this.validator.validate(this.state) : this.state.validation;
        if(this.props.backgroundPage == null) {
            return(<p>Something went wrong.</p>);
        } else if(this.state.token == null || this.state.token === "null" ) {
            return(<p>Something went wrong.</p>);
        } else {
            //<editor-fold desc="Render Token">
            return (
                <Modal.Body>
                    <button className="exit" onClick={this.props.onHide}><IconExit/></button>
                    <div className="modal-wrapper add-menu">
                        <Form ref={(c) => {
                            this.form = c;
                        }} onSubmit={(e) => this.handleSubmit(e)}>
                            <h2 className="title">Edit menu</h2>
                            <div className="input-field">
                                <label>Name</label>
                                <Input type="text" name="name" value={this.state.name}/>
                            </div>
                            <div className="error-block">
                                <small>{validation.name.message}</small>
                            </div>
                            <div className="input-field">
                                <label>Description</label>
                                <Textarea name="description" value={this.state.description}/>
                            </div>
                            <div className="error-block">
                                <small>{validation.description.message}</small>
                            </div>
                            <div className="input-field">
                                <label>Tags</label>
                                <Input type="tags" name="tags" value={this.state.tags}/>
                            </div>
                            <div className="error-block">
                                <small>{validation.tags.message}</small>
                            </div>
                            <Button type="submit" className="normal">Save</Button>
                            <Button type="button" className="delete-button" onClick={this.handleDelete}>Delete Menu</Button>
                            <div className="error-block">
                                <small>{this.state.serverMessage}</small>
                            </div>
                        </Form>
                    </div>
                </Modal.Body>
            );

            //</editor-fold>
        }
    }

    //</editor-fold>

}

//<editor-fold desc="Redux">
const mapStateToProps = (state) => {
    return {
        backgroundPage: state.backgroundPageReducer.backgroundPage,
        currentMenu: state.currentMenuReducer.currentMenu
    };
};

export default connect(mapStateToProps, null)(EditMenuModal);
//</editor-fold>