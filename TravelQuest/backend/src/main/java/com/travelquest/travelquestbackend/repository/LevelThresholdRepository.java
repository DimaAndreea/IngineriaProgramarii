package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.LevelThreshold;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LevelThresholdRepository extends JpaRepository<LevelThreshold, Integer> {
    List<LevelThreshold> findAllByOrderByMinTotalXpAsc();
}
