class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :ensure_login

  protected
    def ensure_login
      redirect_to join_path unless logged_in?
    end

  def logged_in?
    session[:player_id]
  end

  def current_player
    @current_player ||= Player.find(session[:player_id])
  end

  helper_method :logged_in?, :current_player
end
