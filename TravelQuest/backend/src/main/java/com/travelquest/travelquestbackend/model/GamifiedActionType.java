package com.travelquest.travelquestbackend.model;

public enum GamifiedActionType {
    OBJECTIVE_APPROVED,       // turist +50 (xp_reward)
    ITINERARY_JOINED,         // ghid +25
    SUBMISSION_VALIDATED,     // ghid +5 (approve/reject)
    MANUAL_ADJUSTMENT,        // pentru debug/admin, dacă ai nevoie
    MISSION_CLAIM             // pentru xp castigat in momentul claim mission

}
