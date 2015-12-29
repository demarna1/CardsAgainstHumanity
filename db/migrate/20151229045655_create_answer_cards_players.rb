class CreateAnswerCardsPlayers < ActiveRecord::Migration
  def change
    create_table :answer_cards_players, id:false do |t|
      t.references :answer_card, index: true
      t.references :player, index: true
    end
  end
end
