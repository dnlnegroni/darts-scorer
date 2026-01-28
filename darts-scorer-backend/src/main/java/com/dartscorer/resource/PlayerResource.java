package com.dartscorer.resource;

import com.dartscorer.dto.PlayerDTO;
import com.dartscorer.model.Player;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST API for player management
 */
@Path("/api/players")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Players", description = "Player management operations")
public class PlayerResource {
    
    /**
     * Get all players
     */
    @GET
    @Operation(summary = "Get all players", description = "Retrieves all registered players")
    public Response getAllPlayers() {
        List<Player> players = Player.listAll();
        List<PlayerDTO> dtos = players.stream()
            .map(PlayerDTO::from)
            .collect(Collectors.toList());
        return Response.ok(dtos).build();
    }
    
    /**
     * Get player by ID
     */
    @GET
    @Path("/{id}")
    @Operation(summary = "Get player by ID", description = "Retrieves a specific player")
    public Response getPlayer(@PathParam("id") Long id) {
        Player player = Player.findById(id);
        if (player == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new GameResource.ErrorResponse("Player not found"))
                .build();
        }
        return Response.ok(PlayerDTO.from(player)).build();
    }
    
    /**
     * Create a new player
     */
    @POST
    @Transactional
    @Operation(summary = "Create player", description = "Creates a new player")
    public Response createPlayer(PlayerDTO playerDTO) {
        // Check if player with same name already exists
        Player existing = Player.findByName(playerDTO.name);
        if (existing != null) {
            return Response.status(Response.Status.CONFLICT)
                .entity(new GameResource.ErrorResponse("Player with this name already exists"))
                .build();
        }
        
        Player player = new Player(playerDTO.name);
        player.persist();
        
        return Response.status(Response.Status.CREATED)
            .entity(PlayerDTO.from(player))
            .build();
    }
    
    /**
     * Delete a player
     */
    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Delete player", description = "Deletes a player")
    public Response deletePlayer(@PathParam("id") Long id) {
        Player player = Player.findById(id);
        if (player == null) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new GameResource.ErrorResponse("Player not found"))
                .build();
        }
        
        player.delete();
        return Response.noContent().build();
    }
}