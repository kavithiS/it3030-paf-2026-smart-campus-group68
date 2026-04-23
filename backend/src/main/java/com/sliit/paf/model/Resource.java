package com.sliit.paf.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    private String id;

    private String name;

    @com.fasterxml.jackson.annotation.JsonProperty("type")
    private String resourceType; // e.g., "Room", "Lab", "Equipment"

    private int capacity;
    private String location;

    @com.fasterxml.jackson.annotation.JsonProperty("isAvailable")
    private boolean isAvailable;
}
