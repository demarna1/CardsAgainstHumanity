class CreateAnswerCards < ActiveRecord::Migration
  def change
    create_table :answer_cards do |t|
      t.string :text

      t.timestamps null: false
    end
  end
end
