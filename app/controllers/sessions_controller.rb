class SessionsController < ApplicationController
  skip_before_action :ensure_login, only: [:new, :create, :destroy]

  def new
  end

  def create
    room_code = params[:session][:room_code]
    player_name = params[:session][:player_name]

    game = Game.where(room_code: room_code).order(created_at: :desc).first
    if (game)
      player = Player.create(player_name: player_name, game_id: game.id)
      session[:player_id] = player.id
      redirect_to root_path, notice: "Logged in successfully as #{player_name}"
    else
      flash.now[:alert] = "Invalid room code: #{room_code}"
      render action: 'new'
    end
  end

  def destroy
    reset_session
    redirect_to join_path, notice: "You have exited the game"
  end
end
