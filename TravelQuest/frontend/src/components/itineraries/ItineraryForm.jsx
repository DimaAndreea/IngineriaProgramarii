import React, { useState, useEffect } from "react";
import "./ItineraryForm.css";

export default function ItineraryForm({ visible, initialValues, onSubmit, onClose }) {

    const EMPTY_FORM = {
        title: "",
        description: "",
        category: "",
        price: "",
        itinerary_start_date: "",
        itinerary_end_date: "",
        image: "",
        status: "PENDING", // 🔥 important!
        //status: "DRAFT", // if you want to use DRAFT instead"
        locations: [
            {
                country: "",
                city: "",
                objectives: [""]
            }
        ]
    };

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // load initial values for edit mode
    useEffect(() => {
        if (initialValues) {
            setForm({
                ...initialValues,
                status: initialValues.status || "PENDING"  // ensure status is set
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
        setSuccess("");
    }, [initialValues]);

    // make modal clean when reopening
    useEffect(() => {
        if (visible && !initialValues) {
            setForm(EMPTY_FORM);
            setErrors({});
            setSuccess("");
        }
    }, [visible]);

    if (!visible) return null;

    // VALIDATE
    const validate = () => {
        const err = {};

        if (!form.title.trim()) err.title = "Title is required.";
        if (!form.description.trim()) err.description = "Description is required.";
        if (!form.category.trim()) err.category = "Category is required.";

        if (!form.price || Number(form.price) <= 0)
            err.price = "Price must be greater than 0.";

        if (!form.itinerary_start_date) err.itinerary_start_date = "Start date is required.";
        if (!form.itinerary_end_date) err.itinerary_end_date = "End date is required.";
        if (form.itinerary_end_date < form.itinerary_start_date)
            err.itinerary_end_date = "End date cannot be before start date.";

        // validate locations
        form.locations.forEach((loc, index) => {
            if (!loc.country.trim()) err[`loc_${index}_country`] = "Country required.";
            if (!loc.city.trim()) err[`loc_${index}_city`] = "City required.";

            loc.objectives.forEach((obj, j) => {
                if (!obj.trim()) err[`loc_${index}_obj_${j}`] = "Objective required.";
            });
        });

        if (!initialValues && !form.image)
            err.image = "Image is required.";

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErrors({});
        setSuccess("");

        try {
            onSubmit(form);

            setSuccess("Itinerary saved successfully!");
            if (!initialValues) setForm(EMPTY_FORM);

        } catch (err) {
            setErrors({ general: "Unexpected error. Try again." });
        }

        setLoading(false);
    };

    //ORIGINAL IMAGE UPLOAD HANDLER
    /*const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setForm({ ...form, image_base64: reader.result });
        reader.readAsDataURL(file);
    };*/

    // IMAGE UPLOAD HANDLER NOU:
    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {setForm({ ...form, image: reader.result });};
        reader.readAsDataURL(file);
        }
    };
    

    // LOCATION HANDLERS 
    const addLocation = () => {
        setForm({
            ...form,
            locations: [...form.locations, { country: "", city: "", objectives: [""] }]
        });
    };

    const removeLocation = (index) => {
        if (form.locations.length === 1) return;
        const updated = form.locations.filter((_, i) => i !== index);
        setForm({ ...form, locations: updated });
    };

    const updateLocationField = (index, field, value) => {
        const updated = [...form.locations];
        updated[index][field] = value;
        setForm({ ...form, locations: updated });
    };

    const addObjective = (index) => {
        const updated = [...form.locations];
        updated[index].objectives.push("");
        setForm({ ...form, locations: updated });
    };

    const updateObjective = (i, j, value) => {
        const updated = [...form.locations];
        updated[i].objectives[j] = value;
        setForm({ ...form, locations: updated });
    };

    const removeObjective = (i, j) => {
        const updated = [...form.locations];
        if (updated[i].objectives.length === 1) return;
        updated[i].objectives.splice(j, 1);
        setForm({ ...form, locations: updated });
    };

    // UI / RETURN
    return (
        <div className="modal-overlay">
            <div className="modal-container">

                <div className="modal-header">
                    <h2>{initialValues ? "Edit itinerary" : "Create itinerary"}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form className="itinerary-form" onSubmit={handleSubmit}>

                    {/* GENERAL MESSAGE */}
                    {errors.general && <p className="error general-error">{errors.general}</p>}
                    {success && <p className="success-msg">{success}</p>}

                    {/* TITLE */}
                    <label>Title</label>
                    <input
                        name="title"
                        className={errors.title ? "input error-input" : "input"}
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Enter title..."
                    />
                    {errors.title && <p className="error">{errors.title}</p>}

                    {/* DESCRIPTION */}
                    <label>Description</label>
                    <textarea
                        name="description"
                        className={errors.description ? "input error-input" : "input"}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Enter description..."
                    />
                    {errors.description && <p className="error">{errors.description}</p>}

                    {/* CATEGORY */}
                    <label>Category</label>
                    <input
                        name="category"
                        className={errors.category ? "input error-input" : "input"}
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="Adventure, Cultural..."
                    />
                    {errors.category && <p className="error">{errors.category}</p>}

                    {/* PRICE */}
                    <label>Price (RON)</label>
                    <input
                        type="number"
                        name="price"
                        className={errors.price ? "input error-input" : "input"}
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="Price..."
                    />
                    {errors.price && <p className="error">{errors.price}</p>}

                    {/* IMAGE */}
                    <label>Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        className={errors.image ? "input error-input" : "input"}
                        onChange={handleImageUpload}
                    />
                    {errors.image && <p className="error">{errors.image}</p>}

                    {form.image && (
                        <div className="image-preview">
                            <img src={form.image} alt="Preview" />
                        </div>
                    )}

                    {/* DATES */}
                    <div className="dates-row">
                        <div>
                            <label>Start date</label>
                            <input
                                type="date"
                                name="itinerary_start_date"
                                className={errors.itinerary_start_date ? "input error-input" : "input"}
                                value={form.itinerary_start_date}
                                onChange={(e) => setForm({ ...form, itinerary_start_date: e.target.value })}
                            />
                            {errors.itinerary_start_date && <p className="error">{errors.itinerary_start_date}</p>}
                        </div>
                        <div>
                            <label>End date</label>
                            <input
                                type="date"
                                name="itinerary_end_date"
                                className={errors.itinerary_end_date ? "input error-input" : "input"}
                                value={form.itinerary_end_date}
                                onChange={(e) => setForm({ ...form, itinerary_end_date: e.target.value })}
                            />
                            {errors.itinerary_end_date && <p className="error">{errors.itinerary_end_date}</p>}
                        </div>
                    </div>

                    {/* LOCATIONS SECTION */}
                    <h3 className="section-title">Locations</h3>

                    {form.locations.map((loc, i) => (
                        <div key={i} className="location-box">

                            <div className="location-header">
                                <h4>Location #{i + 1}</h4>

                                {form.locations.length > 1 && (
                                    <button
                                        type="button"
                                        className="remove-location-btn"
                                        onClick={() => removeLocation(i)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            {/* COUNTRY */}
                            <label>Country</label>
                            <input
                                className={errors[`loc_${i}_country`] ? "input error-input" : "input"}
                                value={loc.country}
                                onChange={(e) =>
                                    updateLocationField(i, "country", e.target.value)
                                }
                                placeholder="Country..."
                            />
                            {errors[`loc_${i}_country`] && (
                                <p className="error">{errors[`loc_${i}_country`]}</p>
                            )}

                            {/* CITY */}
                            <label>City</label>
                            <input
                                className={errors[`loc_${i}_city`] ? "input error-input" : "input"}
                                value={loc.city}
                                onChange={(e) =>
                                    updateLocationField(i, "city", e.target.value)
                                }
                                placeholder="City..."
                            />
                            {errors[`loc_${i}_city`] && (
                                <p className="error">{errors[`loc_${i}_city`]}</p>
                            )}

                            {/* OBJECTIVES */}
                            <h5 className="small-title">Objectives</h5>

                            {loc.objectives.map((obj, j) => (
                                <div key={j} className="objective-row">
                                    <input
                                        className={
                                            errors[`loc_${i}_obj_${j}`]
                                                ? "input error-input"
                                                : "input"
                                        }
                                        value={obj}
                                        onChange={(e) => updateObjective(i, j, e.target.value)}
                                        placeholder="Objective..."
                                    />

                                    {errors[`loc_${i}_obj_${j}`] && (
                                        <p className="error">{errors[`loc_${i}_obj_${j}`]}</p>
                                    )}

                                    {loc.objectives.length > 1 && (
                                        <button
                                            type="button"
                                            className="remove-objective-btn"
                                            onClick={() => removeObjective(i, j)}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                className="add-objective-btn"
                                onClick={() => addObjective(i)}
                            >
                                + Add objective
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        className="add-location-btn"
                        onClick={addLocation}
                    >
                        + Add location
                    </button>

                    {/* BUTTONS */}
                    <button className="login-btn" disabled={loading}>
                        {loading ? "Saving..." : initialValues ? "Save" : "Create"}
                    </button>

                    <button type="button" className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
