package com.travelquest.travelquestbackend.repository;

import com.travelquest.travelquestbackend.model.LevelThreshold;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LevelThresholdRepository extends JpaRepository<LevelThreshold, Integer> {

    List<LevelThreshold> findAllByOrderByMinTotalXpAsc();

    Optional<LevelThreshold> findFirstByMinTotalXpGreaterThanOrderByMinTotalXpAsc(Integer xp);

    Optional<LevelThreshold> findByLevel(Integer level);
}
