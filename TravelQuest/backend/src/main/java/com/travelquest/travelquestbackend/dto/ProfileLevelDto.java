package com.travelquest.travelquestbackend.dto;

public class ProfileLevelDto {

    private int level;
    private int xp;

    private Integer currentLevelMinXp;   // pragul XP pentru nivelul curent
    private Integer nextLevel;           // null dacă e max level
    private Integer nextLevelMinXp;      // null dacă e max level
    private Integer xpToNextLevel;       // null dacă e max level

    private Double progress;             // 0..1 (null dacă e max level)

    public ProfileLevelDto() {}

    public ProfileLevelDto(int level, int xp,
                           Integer currentLevelMinXp,
                           Integer nextLevel,
                           Integer nextLevelMinXp,
                           Integer xpToNextLevel,
                           Double progress) {
        this.level = level;
        this.xp = xp;
        this.currentLevelMinXp = currentLevelMinXp;
        this.nextLevel = nextLevel;
        this.nextLevelMinXp = nextLevelMinXp;
        this.xpToNextLevel = xpToNextLevel;
        this.progress = progress;
    }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public int getXp() { return xp; }
    public void setXp(int xp) { this.xp = xp; }

    public Integer getCurrentLevelMinXp() { return currentLevelMinXp; }
    public void setCurrentLevelMinXp(Integer currentLevelMinXp) { this.currentLevelMinXp = currentLevelMinXp; }

    public Integer getNextLevel() { return nextLevel; }
    public void setNextLevel(Integer nextLevel) { this.nextLevel = nextLevel; }

    public Integer getNextLevelMinXp() { return nextLevelMinXp; }
    public void setNextLevelMinXp(Integer nextLevelMinXp) { this.nextLevelMinXp = nextLevelMinXp; }

    public Integer getXpToNextLevel() { return xpToNextLevel; }
    public void setXpToNextLevel(Integer xpToNextLevel) { this.xpToNextLevel = xpToNextLevel; }

    public Double getProgress() { return progress; }
    public void setProgress(Double progress) { this.progress = progress; }
}
