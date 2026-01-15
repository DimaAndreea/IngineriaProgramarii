package com.travelquest.travelquestbackend.dto;

public class GamificationSummaryDto {

    private int level;
    private int xp;

    private Integer nextLevel;
    private Integer nextLevelMinXp;
    private Integer xpToNextLevel;
    private Double progress; // 0..1 or null dacă max level

    private SelectedBadgeDto selectedBadge; // null dacă nu are selectat

    public GamificationSummaryDto() {}

    public GamificationSummaryDto(int level, int xp,
                                  Integer nextLevel,
                                  Integer nextLevelMinXp,
                                  Integer xpToNextLevel,
                                  Double progress,
                                  SelectedBadgeDto selectedBadge) {
        this.level = level;
        this.xp = xp;
        this.nextLevel = nextLevel;
        this.nextLevelMinXp = nextLevelMinXp;
        this.xpToNextLevel = xpToNextLevel;
        this.progress = progress;
        this.selectedBadge = selectedBadge;
    }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public int getXp() { return xp; }
    public void setXp(int xp) { this.xp = xp; }

    public Integer getNextLevel() { return nextLevel; }
    public void setNextLevel(Integer nextLevel) { this.nextLevel = nextLevel; }

    public Integer getNextLevelMinXp() { return nextLevelMinXp; }
    public void setNextLevelMinXp(Integer nextLevelMinXp) { this.nextLevelMinXp = nextLevelMinXp; }

    public Integer getXpToNextLevel() { return xpToNextLevel; }
    public void setXpToNextLevel(Integer xpToNextLevel) { this.xpToNextLevel = xpToNextLevel; }

    public Double getProgress() { return progress; }
    public void setProgress(Double progress) { this.progress = progress; }

    public SelectedBadgeDto getSelectedBadge() { return selectedBadge; }
    public void setSelectedBadge(SelectedBadgeDto selectedBadge) { this.selectedBadge = selectedBadge; }
}
