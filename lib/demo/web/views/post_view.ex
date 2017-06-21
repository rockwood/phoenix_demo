defmodule Demo.Web.PostView do
  use Demo.Web, :view

  def format_date(%{year: year, month: month, day: day}) do
    "#{year}-#{month}-#{day}"
  end
end
