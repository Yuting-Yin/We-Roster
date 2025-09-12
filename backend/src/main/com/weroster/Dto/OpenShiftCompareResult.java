// src/main/java/main/com/weroster/Dto/OpenShiftCompareResult.java
package main.com.weroster.Dto;

import java.util.List;

public class OpenShiftCompareResult {
    public int countA;
    public int countB;
    public List<Long> added;
    public List<Long> removed;

    public OpenShiftCompareResult() {}

    public OpenShiftCompareResult(int countA, int countB,
                                  List<Long> added, List<Long> removed) {
        this.countA = countA;
        this.countB = countB;
        this.added = added;
        this.removed = removed;
    }
}
