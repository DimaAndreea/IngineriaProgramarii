package com.travelquest.travelquestbackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "levels")
public class LevelThreshold {

    @Id
    @Column(name = "level")
    private Integer level;

    @Column(name = "min_total_xp", nullable = false, unique = true)
    private Integer minTotalXp;

    public LevelThreshold() {}

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public Integer getMinTotalXp() { return minTotalXp; }
    public void setMinTotalXp(Integer minTotalXp) { this.minTotalXp = minTotalXp; }
}
