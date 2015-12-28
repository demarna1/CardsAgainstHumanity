class SessionsController < ApplicationController
  def new
  end

  def create
    room_code = params[:session][:room_code]
    player_name = params[:session][:player_name]

    game = Game.find_by room_code: room_code
    if (game)
      # create new player
      #session[:player_id] = player.id
      redirect_to root_path, notice: "Logged in successfully as #{player_name}"
    else
      flash.now[:alert] = "Invalid room code: #{room_code}"
      render 'new'
    end
  end

  def destroy
  end
end
