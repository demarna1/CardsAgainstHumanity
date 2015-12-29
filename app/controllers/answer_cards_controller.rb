class AnswerCardsController < ApplicationController
  def index
    @answer_cards = current_player.answer_cards
  end
end
