//<editor-fold desc="React">
import React, {Component} from "react";
//</editor-fold>
//<editor-fold desc="RxJs">
import {bindCallback, of, throwError} from "rxjs";
import {ajax} from "rxjs/ajax";
import {exhaustMap, map, take} from "rxjs/operators";
//</editor-fold>
//<editor-fold desc="Redux">
import {connect} from "react-redux";
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
//</editor-fold>
//<editor-fold desc="Icons">
import {IconExit} from "../../Icons";
import {modalVisibilityFilters} from "../../../constants/modalVisibiltyFilters";
import {timeout} from "../../../constants/timeout";

//</editor-fold>


class EditMenuItemModal extends Component {
    //<editor-fold desc="Constructor">
    constructor(props) {
        super(props);

        this.validator = new FormValidator([
            {
                field: "name",
                method: "isEmpty",
                validWhen: false,
                message: "Dish name is required"
            },
            {
                field: "description",
                method: "isEmpty",
                validWhen: false,
                message: "Description is required"
            },
            {
                field: "price",
                method: "isEmpty",
                validWhen: false,
                message: "Price is required"
            },
            {
                field: "tags",
                method: "isEmpty",
                validWhen: false,
                message: "Tags are required"
            }
        ]);

        this.fileSelectedHandler = this.fileSelectedHandler.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            name: "",
            description: "",
            price: "",
            type: "",
            imageID: 0,
            imageMessage: "",
            tags: "",
            validation: this.validator.valid(),
            serverMessage: "",
            submitted: false
        };
    }

    //</editor-fold>

    //<editor-fold desc="Bussiness Logic">
    fileSelectedHandler = (event) => {
        const thisTemp = this;
        thisTemp.setState({ imageMessage: "", selectedFile: null });
        let file = event.target.files[0];
        if(["image/png","image/jpeg"].includes(file.type)) {
            let formData = new FormData();
            formData.append("image", file);
            let reader = new FileReader();
            thisTemp.setState({serverMessage: "Image upload is processing"});
            reader.onload = () => {
                ajax({
                    url: paths["restApi"]["image"],
                    method: "POST",
                    headers: {"X-Auth-Token": thisTemp.props.token},
                    body: formData,
                    timeout: timeout,
                    responseType: "text"
                })
                    .pipe(take(1))
                    .subscribe(
                        (next) => {
                            let response = JSON.parse(next.response);
                            thisTemp.setState({imageID: response.imageID, selectedFile: file});
                        }, (error) => {
                            thisTemp.props.failLogIn();
                            switch (error.name) {
                                case "AjaxTimeoutError":
                                    thisTemp.setState({
                                        imageMessage: (file.name + " could not be uploaded, the request timed out (" + "408" + ")"),
                                        serverMessage: ("Error " + "400" + ": " + "One of the fields above is not correctly filled.")
                                    });
                                    break;
                                case "InternalError":
                                case "AjaxError":
                                    if (error.status === 0 && error.response === "") {
                                        thisTemp.setState({
                                            imageMessage: (file.name + " could not be uploaded, no connection to the server (" + "0" + ")"),
                                            serverMessage: ("Error " + "400" + ": " + "One of the fields above is not correctly filled.")
                                        });
                                    } else {
                                        thisTemp.setState({
                                            imageMessage: (file.name + " could not be uploaded, " + error.response + " (" + error.status + ")"),
                                            serverMessage: ("Error " + "400" + ": " + "One of the fields above is not correctly filled.")
                                        });
                                    }
                                    break;
                                default:
                                    console.log(error);
                                    thisTemp.setState({
                                        imageMessage: ("Code error"),
                                        serverMessage: ("Error " + "400" + ": " + "One of the fields above is not correctly filled.")
                                    });
                                    break;
                            }
                        }
                    );
            };
            reader.onerror = () => {
                thisTemp.setState({ imageMessage: (file.name + " could not be read.")});
            };
            reader.readAsText(file);
        }
        else {
            //thisTemp.setState({ imageMessage: (file.type + " is not supported.\n Please use image/png or image/jpeg.")});
            // \n does not work in a state
            thisTemp.setState({ imageMessage: ("Please use .jpeg or .png format")});
        }
    };

    handleSubmit = event => {
        event.preventDefault();
        const thisTemp = this;

        of(1)
            .pipe(map(() => {
                return thisTemp.form.getValues();
            }))
            .pipe(exhaustMap((values) => {
                return bindCallback(thisTemp.setState).call(thisTemp, {
                    name: values.name,
                    description: values.description,
                    price: parseInt(values.priceEuros),
                    type: thisTemp.props.modalVisibilityFilter === modalVisibilityFilters.SHOW_ADD_DISH ? "dish" : "drink",
                    imageID: thisTemp.state.imageID,
                    tags: values.tags.split(",").map(tag => tag.trim())
                });
            }))
            .pipe(exhaustMap(() => {
                return bindCallback(thisTemp.setState).call(thisTemp, {
                    validation: thisTemp.validator.validate(thisTemp.state),
                    submitted: true,
                    serverMessage: ""
                });
            }))
            .pipe(exhaustMap(() => {
                if (thisTemp.state.validation.isValid) {
                    thisTemp.setState({serverMessage: "New dish is edited"});
                    return ajax({
                        url: paths["restApi"]["menu"] + "/" + thisTemp.props.menuID + "/" + "menuItem" + "/" + thisTemp.props.menuItemID,
                        method: "PUT",
                        headers: {"Content-Type": "application/json", "X-Auth-Token": thisTemp.props.token},
                        body: {
                            name: thisTemp.state.name,
                            description: thisTemp.state.description,
                            price: thisTemp.state.price,
                            type: thisTemp.state.type,
                            imageID: thisTemp.state.imageID,
                            tags: thisTemp.state.tags
                        },
                        timeout: timeout,
                        responseType: "text"
                    })
                } else {
                    return throwError({
                        name: "InternalError",
                        status: 0,
                        response: "One of the fields above is not correctly filled."
                    });
                }
            }))
            .pipe(take(1))
            .subscribe(
                () => {
                    thisTemp.props.onHide();
                }, (error) => {
                    switch (error.name) {
                        case "AjaxTimeoutError":
                            thisTemp.setState({serverMessage: "Error 408: The request timed out."});
                            break;
                        case "InternalError":
                        case "AjaxError":
                            if (error.status === 0 && error.response === "") {
                                thisTemp.setState({serverMessage: "Error " + error.status + ": " + "No connection to the server."});
                            } else {
                                thisTemp.setState({serverMessage: "Error " + error.status + ": " + error.response});
                            }
                            break;
                        default:
                            console.log(error);
                            thisTemp.setState({serverMessage: "Code error"});
                            break;
                    }
                }
            );
    };
    //</editor-fold>
    //<editor-fold desc="Render">
    render() {
        let validation = !this.submitted ? this.state.validation : this.validator.validate(this.state);
        return (
            <Modal.Body>
                <button className="exit" onClick={this.props.onHide}><IconExit/></button>
                <div className="modal-wrapper restaurant-info">
                    <Form ref={(c) => {
                        this.form = c;
                    }} onSubmit={(e) => this.handleSubmit(e)}>
                        <h2>Edit</h2>
                        <div className="account-type">
                            <h4><span className="role">Dish</span></h4>
                        </div>

                        <div className="input-field">
                            <label>Dish name</label>
                            <Input type="text" name="dishName" placeholder="Dish name"/>
                        </div>
                        <div className="error-block">
                            <small>{validation.name.message}</small>
                        </div>

                        <div className="input-field">
                            <label>Description</label>
                            <Textarea name="description"/>
                        </div>
                        <div className="error-block">
                            <small>{validation.description.message}</small>
                        </div>


                        <div className="input-field">
                            <label>Price in Euro (€)</label>
                            <Input placeholder="Price"/>
                        </div>
                        <div className="error-block">
                            <small>{validation.price.message}</small>
                        </div>

                        <div className="input-field image">
                            <label>Image</label>
                            <input type="file" name="file" id="file" className="inputfile"
                                   onChange={this.fileSelectedHandler}/>
                            <label htmlFor="file">+ Upload image</label>
                            {this.state.selectedFile &&
                            <label className="selected-file">
                            <span onClick={this.removeFile}
                                  role="button"
                                  className="remove-button">
                                X
                            </span>
                                {this.state.selectedFile.name}
                            </label>
                            }
                        </div>
                        {/*
                        <div className="error-block">
                            <small>{this.state.imageMessage}</small>
                        </div>
                         */}

                        <div className="input-field">
                            <label>Tags</label>
                            <Input type="tags" name="tags" placeholder="Search"/>
                        </div>
                        <div className="error-block">
                            <small>{validation.tags.message}</small>
                        </div>

                        <Button type="submit" className="normal">Save</Button>
                        <Button type="submit" className="delete-button">Delete Dish</Button>
                        <div className="error-block">
                            <small>{this.state.serverMessage}</small>
                        </div>
                    </Form>
                </div>
            </Modal.Body>
        )
    }

    //</editor-fold>
}

//<editor-fold desc="Redux">
const mapStateToProps = (state) => {
    return {
        token: state.logInReducer.token,
        modalVisibilityFilter: state.modalVisibiltyFilterReducer.modalVisibilityFilter,
    };
};

export default connect(mapStateToProps, null)(EditMenuItemModal);
//</editor-fold>