class Player < ActiveRecord::Base
  belongs_to :game
  has_and_belongs_to_many :answer_cards
end
