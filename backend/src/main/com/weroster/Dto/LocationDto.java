package main.com.weroster.Dto;

public class LocationDto {
    public String campus;   // use location.name
    public String address;  // you don't have it -> null
    public String room;     // you don't have it -> null

    public LocationDto() {}
    public LocationDto(String campus, String address, String room) {
        this.campus = campus; this.address = address; this.room = room;
    }
}