// src/main/com/weroster/dto/SwapShiftResponse.java
package main.com.weroster.Dto;

import java.util.List;

public class SwapShiftResponse {
    public SwapShiftMineDto mine;
    public SearchSection search;

    public static class SearchSection {
        public int total;
        public List<SwapCandidateItemDto> items;
    }
}
