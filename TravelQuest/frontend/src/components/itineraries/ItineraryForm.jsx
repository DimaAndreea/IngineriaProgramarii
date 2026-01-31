import React, { useState, useEffect, useMemo } from "react";
import DateRangePickerField from "../ui/DateRangePickerField";
import "./ItineraryForm.css";

export default function ItineraryForm({ visible, initialValues, onSubmit, onClose }) {

    // ENUM categories from backend
    const CATEGORY_OPTIONS = [
        { value: "CULTURAL", label: "Cultural" },
        { value: "ADVENTURE", label: "Adventure" },
        { value: "CITY_BREAK", label: "City Break" },
        { value: "ENTERTAINMENT", label: "Entertainment" },
        { value: "EXOTIC", label: "Exotic" }
    ];

    const EMPTY_FORM = {
        title: "",
        description: "",
        category: "",
        price: "",
        startDate: "",
        endDate: "",
        imageBase64: "",
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

    // ----------------------------- LOAD INITIAL VALUES (EDIT) -----------------------------
    useEffect(() => {
        if (initialValues) {
            const normalizedLocations = initialValues.locations?.map(loc => ({
                country: loc.country || "",
                city: loc.city || "",
                objectives: Array.isArray(loc.objectives)
                    ? loc.objectives.map(obj => obj.name ?? obj)
                    : [""]
            })) || [];

            setForm({
                ...EMPTY_FORM,
                ...initialValues,
                id: initialValues.id,
                startDate: initialValues.startDate || "",
                endDate: initialValues.endDate || "",
                imageBase64: initialValues.imageBase64 || "",
                locations: normalizedLocations
            });
        } else {
            setForm(EMPTY_FORM);
        }

        setErrors({});
        setSuccess("");
    }, [initialValues]);

    // RESET FORM WHEN MODAL REOPENS (CREATE)
    useEffect(() => {
        if (visible && !initialValues) {
            setForm(EMPTY_FORM);
            setErrors({});
            setSuccess("");
        }
    }, [visible]);

    const minDate = useMemo(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    // ----------------------------- VALIDATION -----------------------------
    const validate = () => {
        const err = {};

        if (!form.title.trim()) err.title = "Title is required.";
        if (!form.description.trim()) err.description = "Description is required.";
        if (!form.category.trim()) err.category = "Category is required.";

        if (!form.price || Number(form.price) <= 0)
            err.price = "Price must be greater than 0.";

        if (!form.startDate) err.startDate = "Start date is required.";
        if (!form.endDate) err.endDate = "End date is required.";
        if (form.endDate < form.startDate)
            err.endDate = "End date cannot be before start date.";

        form.locations.forEach((loc, index) => {
            if (!loc.country.trim()) err[`loc_${index}_country`] = "Country required.";
            if (!loc.city.trim()) err[`loc_${index}_city`] = "City required.";

            loc.objectives.forEach((obj, j) => {
                if (!obj.trim()) err[`loc_${index}_obj_${j}`] = "Objective required.";
            });
        });

        if (!initialValues && !form.imageBase64)
            err.imageBase64 = "Image is required.";

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    // ----------------------------- TRANSFORM TO BACKEND DTO -----------------------------
    const toBackendPayload = (form) => {
        return {
            id: form.id,
            guideId: Number(localStorage.getItem("userId")),
            title: form.title,
            description: form.description,
            category: form.category,  
            price: Number(form.price),
            imageBase64: form.imageBase64,
            startDate: form.startDate,
            endDate: form.endDate,
            locations: form.locations.map(loc => ({
                country: loc.country,
                city: loc.city,
                objectives: loc.objectives
            }))
        };
    };

    // ----------------------------- SUBMIT HANDLER -----------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErrors({});
        setSuccess("");

        try {
            const payload = toBackendPayload(form);
            await onSubmit(payload);

            setSuccess("Itinerary saved successfully!");
            if (!initialValues) setForm(EMPTY_FORM);

        } catch (err) {
            console.error(err);
            setErrors({ general: "Unexpected error. Try again." });
        }

        setLoading(false);
    };

    if (!visible) return null;

    // ----------------------------- IMAGE UPLOAD HANDLER -----------------------------
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setForm({ ...form, imageBase64: reader.result });
        reader.readAsDataURL(file);
    };

    // ----------------------------- LOCATION HANDLERS -----------------------------
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

    // ----------------------------- RENDER FORM -----------------------------
    return (
        <div className="modal-overlay">
            <div className="modal-container">

                <div className="modal-header">
                    <h2>{initialValues ? "Edit itinerary" : "Create itinerary"}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form className="itinerary-form" onSubmit={handleSubmit}>

                    {errors.general && <p className="error general-error">{errors.general}</p>}
                    {success && <p className="success-msg">{success}</p>}

                    {/* TITLE */}
                    <label>Title</label>
                    <input
                        className={errors.title ? "input error-input" : "input"}
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Enter title..."
                    />
                    {errors.title && <p className="error">{errors.title}</p>}

                    {/* DESCRIPTION */}
                    <label>Description</label>
                    <textarea
                        className={errors.description ? "input error-input" : "input"}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Enter description..."
                    />
                    {errors.description && <p className="error">{errors.description}</p>}

                    {/* CATEGORY — NOW DROPDOWN */}
                    <label>Category</label>
                    <select
                        className={errors.category ? "input error-input" : "input"}
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                        <option value="">Select a category...</option>

                        {CATEGORY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {errors.category && <p className="error">{errors.category}</p>}

                    {/* PRICE */}
                    <label>Price (RON)</label>
                    <input
                        type="number"
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
                        className={errors.imageBase64 ? "input error-input" : "input"}
                        onChange={handleImageUpload}
                    />
                    {errors.imageBase64 && <p className="error">{errors.imageBase64}</p>}

                    {form.imageBase64 && (
                        <div className="image-preview">
                            <img src={form.imageBase64} alt="Preview" />
                        </div>
                    )}

                    {/* DATES */}
                    <div className="dates-row">
                        <div>
                            <DateRangePickerField
                                label="When"
                                startDate={form.startDate}
                                endDate={form.endDate}
                                onChange={(start, end) =>
                                    setForm((prev) => ({ ...prev, startDate: start, endDate: end }))
                                }
                                minDate={minDate}
                                required
                            />
                            {errors.startDate && <p className="error">{errors.startDate}</p>}
                            {errors.endDate && <p className="error">{errors.endDate}</p>}
                        </div>
                    </div>

                    {/* LOCATIONS */}
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

                    {/* ACTION BUTTONS */}
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
