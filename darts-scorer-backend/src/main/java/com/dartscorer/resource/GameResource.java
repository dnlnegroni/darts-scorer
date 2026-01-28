package com.dartscorer.resource;

import com.dartscorer.dto.*;
import com.dartscorer.model.Game;
import com.dartscorer.service.GameService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST API for game management
 */
@Path("/api/games")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Games", description = "Game management operations")
public class GameResource {
    
    @Inject
    GameService gameService;
    
    /**
     * Create a new game
     */
    @POST
    @Operation(summary = "Create a new game", description = "Creates a new game with specified mode and players")
    public Response createGame(CreateGameRequest request) {
        try {
            Game game = gameService.createGame(request.gameMode, request.playerNames);
            GameStateDTO dto = GameStateDTO.from(game);
            return Response.status(Response.Status.CREATED).entity(dto).build();
        } catch (BadRequestException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        }
    }
    
    /**
     * Get game state by ID
     */
    @GET
    @Path("/{id}")
    @Operation(summary = "Get game state", description = "Retrieves the current state of a game")
    public Response getGame(@PathParam("id") Long id) {
        try {
            Game game = gameService.getGame(id);
            GameStateDTO dto = GameStateDTO.from(game);
            return Response.ok(dto).build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        }
    }
    
    /**
     * Record a throw
     */
    @POST
    @Path("/{id}/throw")
    @Operation(summary = "Record a throw", description = "Records a dart throw in the current turn")
    public Response recordThrow(@PathParam("id") Long id, RecordThrowRequest request) {
        try {
            Game game = gameService.recordThrow(id, request.sector, request.multiplier);
            GameStateDTO dto = GameStateDTO.from(game);
            return Response.ok(dto).build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        } catch (BadRequestException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        }
    }
    
    /**
     * Move to next player
     */
    @POST
    @Path("/{id}/next-player")
    @Operation(summary = "Next player", description = "Moves to the next player's turn")
    public Response nextPlayer(@PathParam("id") Long id) {
        try {
            Game game = gameService.nextPlayer(id);
            GameStateDTO dto = GameStateDTO.from(game);
            return Response.ok(dto).build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        } catch (BadRequestException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        }
    }
    
    /**
     * Get game history
     */
    @GET
    @Path("/{id}/history")
    @Operation(summary = "Get game history", description = "Retrieves the history of all turns in the game")
    public Response getGameHistory(@PathParam("id") Long id) {
        try {
            var turns = gameService.getGameHistory(id);
            List<TurnDTO> dtos = turns.stream()
                .map(TurnDTO::from)
                .collect(Collectors.toList());
            return Response.ok(dtos).build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        }
    }
    
    /**
     * Delete a game
     */
    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete game", description = "Deletes a game")
    public Response deleteGame(@PathParam("id") Long id) {
        try {
            gameService.deleteGame(id);
            return Response.noContent().build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(new ErrorResponse(e.getMessage()))
                .build();
        }
    }
    
    /**
     * Get all active games
     */
    @GET
    @Operation(summary = "Get active games", description = "Retrieves all games currently in progress")
    public Response getActiveGames() {
        List<Game> games = gameService.getActiveGames();
        List<GameStateDTO> dtos = games.stream()
            .map(GameStateDTO::from)
            .collect(Collectors.toList());
        return Response.ok(dtos).build();
    }
    
    /**
     * Error response class
     */
    public static class ErrorResponse {
        public String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
    }
}